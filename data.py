from persistent import Persistent
from persistent.list import PersistentList


class App(Persistent):
    def __init__(self) -> None:
        super().__init__()
        self.settings = Settings()


class Settings(Persistent):
    def __init__(self) -> None:
        super().__init__()
        self.titleText = ""
        self.placeholder = ""
        self.presetQuestions = PersistentList()
        self.frontmatter = ""
