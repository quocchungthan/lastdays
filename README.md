### Introduction
### Objectives
### Installation
Given that this computer already has Python and pip installed.
#### Conda
[Windows-x86_64.exe](https://repo.anaconda.com/miniconda/Miniconda3-latest-Windows-x86_64.exe)

Dont forget to check the box "Add conda to PATH in environment varialbes"

At the working directory, create, activate and install related packages in the venv:
```
conda create -n <envname> [names of packages]
```
```
conda activate <just created envname>
```
```
pip install -r requirements.txt
```

Good job!
Also, you can find more words and explaination here [Notion page](https://www.notion.so/chungbattu/studying-fastapi-78533a5799674c1b8af366beac553096).

Command to start:
```
uvicorn main:app --reload
```
But for Vscode, it's much more simple since launch file already set. Just go to the tab "Debug" then click run at the configuration named "Python Debugger: FastAPI"