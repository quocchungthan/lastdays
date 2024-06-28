@echo off

REM Navigate to the directory where your Angular app is located
cd /d %USERPROFILE%\Documents\lastdays\scripts
if errorlevel 1 (
    echo Failed to navigate to the specified directory.
    exit /b 1
)

REM Checkout to the feature/web-socket branch >> log.txt

git checkout feature/web-socket >> log.txt

if errorlevel 1 (
    echo Failed to checkout to feature/web-socket branch. >> log.txt
    exit /b 1
)

REM Pull the latest changes from the Git repository
git pull --all
if errorlevel 1 (
    echo Failed to pull from Git repository.
    exit /b 1
)

REM Start ng serve in the same command window
cd /d %USERPROFILE%\Documents\lastdays\reactive-UI
start "Angular app 1" ng serve --port 4201 -o

REM Activate your Conda environment and start uvicorn in another window
cd /d %USERPROFILE%\Documents\lastdays
conda activate deploymentenv 
conda install python=3.12.2 --quiet 
pip install -r requirements.txt --quiet 
uvicorn main:app --reload

REM Pause to keep the command windows open (optional)
pause
