@echo off
REM Check if conda is available
where conda >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo Conda is not installed. Please install Anaconda or Miniconda first.
    exit /b 1
)

REM Define the environment name
SET ENV_NAME=toolscv
SET PYTHON_VERSION=3.12.2

REM Check if the environment exists
conda info --envs | findstr /i "%ENV_NAME%" > nul
IF %ERRORLEVEL% EQU 0 (
    echo Environment "%ENV_NAME%" already exists.
) ELSE (
    echo Environment "%ENV_NAME%" does not exist. Creating environment...
    conda create --yes --name %ENV_NAME% python=%PYTHON_VERSION%
)

REM Activate the environment
echo Activating environment "%ENV_NAME%"...
call conda activate %ENV_NAME%

echo Done. You are now in the "%ENV_NAME%" environment with Python %PYTHON_VERSION%.
