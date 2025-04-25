import curses
import time
import asyncio
import queue

import numpy as np
import numpy.typing as npt
import sounddevice as sd


def _record_audio(screen: curses.window) -> npt.NDArray[np.float32]:
    screen.nodelay(True)  # Non-blocking input
    screen.clear()
    screen.addstr(
        "Press <spacebar> to start recording. Press <spacebar> again to stop recording.\n"
    )
    screen.refresh()

    recording = False
    audio_buffer: list[npt.NDArray[np.float32]] = []

    def _audio_callback(indata, frames, time_info, status):
        if status:
            screen.addstr(f"Status: {status}\n")
            screen.refresh()
        if recording:
            audio_buffer.append(indata.copy())

    # Open the audio stream with the callback.
    with sd.InputStream(samplerate=24000, channels=1, dtype=np.float32, callback=_audio_callback):
        while True:
            key = screen.getch()
            if key == ord(" "):
                recording = not recording
                if recording:
                    screen.addstr("Recording started...\n")
                else:
                    screen.addstr("Recording stopped.\n")
                    break
                screen.refresh()
            time.sleep(0.01)

    # Combine recorded audio chunks.
    if audio_buffer:
        audio_data = np.concatenate(audio_buffer, axis=0)
    else:
        audio_data = np.empty((0,), dtype=np.float32)

    return audio_data


def record_audio():
    # Using curses to record audio in a way that:
    # - doesn't require accessibility permissions on macos
    # - doesn't block the terminal
    audio_data = curses.wrapper(_record_audio)
    return audio_data


class AudioPlayer:
    def __enter__(self):
        self.stream = sd.OutputStream(samplerate=24000, channels=1, dtype=np.int16)
        self.stream.start()
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.stream.stop()  # wait for the stream to finish
        self.stream.close()

    def add_audio(self, audio_data: npt.NDArray[np.int16]):
        self.stream.write(audio_data)


class ContinuousAudioStreamer:
    """Class for continuously streaming audio from the microphone."""
    
    def __init__(self, samplerate=24000, channels=1, dtype=np.float32, blocksize=4800):
        self.samplerate = samplerate
        self.channels = channels
        self.dtype = dtype
        self.blocksize = blocksize
        self.q = asyncio.Queue()
        self.stream = None
        self._running = False
        
    def _audio_callback(self, indata, frames, time_info, status):
        """This is called from a different thread by the sounddevice library."""
        if status:
            print(f"Status: {status}")
        
        # Ensure data is the correct format (float32)
        if indata.dtype != np.float32:
            indata = indata.astype(np.float32)
            
        # Ensure data is the correct shape (if multichannel, convert to mono)
        if indata.shape[1] > 1:
            indata = np.mean(indata, axis=1, keepdims=True)
        
        # Put the audio data in the queue
        asyncio.run_coroutine_threadsafe(self.q.put(indata.copy()), asyncio.get_event_loop())
            
    async def start(self):
        """Start the audio streaming."""
        if self._running:
            return
            
        self._running = True
        self.stream = sd.InputStream(
            samplerate=self.samplerate,
            channels=self.channels,
            dtype=self.dtype,
            blocksize=self.blocksize,
            callback=self._audio_callback
        )
        self.stream.start()
        print("Audio streaming started. Press Ctrl+C to stop.")
        
    def stop(self):
        """Stop the audio streaming."""
        if self.stream:
            self.stream.stop()
            self.stream.close()
            self.stream = None
        self._running = False
        print("Audio streaming stopped.")
        
    async def get_audio_chunk(self):
        """Get the next audio chunk from the queue."""
        if not self._running:
            await self.start()
        
        return await self.q.get()
        
    async def __aiter__(self):
        """Make this class iterable in an async context."""
        return self
        
    async def __anext__(self):
        """Get the next audio chunk."""
        if not self._running:
            await self.start()
            
        return await self.get_audio_chunk()