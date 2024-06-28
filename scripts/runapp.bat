@echo off
cd /d %USERPROFILE%\Documents\lastdays\scripts
REM Navigate to the directory where your Angular app is located
if errorlevel 1 (
    echo Failed to navigate to the specified directory.
    exit /b 1
)

REM Checkout to the feature/web-socket branch
git checkout feature/web-socket
if errorlevel 1 (
    echo Failed to checkout to feature/web-socket branch.
    exit /b 1
)

REM Pull the latest changes from the Git repository
git pull --all
if errorlevel 1 (
    echo Failed to pull from Git repository.
    exit /b 1
)


create -n deploymentenv python=3.12.2 -y >> log.txt
init cmd.exe >> log.txt

REM Start ng serve in the same command window
cd /d %USERPROFILE%\Documents\lastdays\reactive-UI
start "Angular app" ng serve --port 4201 -o

REM Activate your Conda environment and start uvicorn in another window
start "Python App" cd /d %USERPROFILE%\Documents\lastdays && conda activate deploymentenv && conda install python=3.12.2 --quiet && pip install -r requirements.txt --quiet && uvicorn main:app --reload

REM Pause to keep the command windows open (optional)
pause
