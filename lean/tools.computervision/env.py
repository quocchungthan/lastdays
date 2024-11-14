import os

DEFAULT_FAKE_VALUE = 'fake one'

class Env:
    VIDEO_ASSETS_DIR = os.getenv('VIDEO_ASSETS_DIR', 'D:/assets/')