@echo off
REM Check if conda is available
where conda >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo Conda is not installed. Please install Anaconda or Miniconda first.
    exit /b 1
)

REM Define the environment name
SET ENV_NAME=toolscv

REM Check if the environment exists
conda info --envs | findstr /i "%ENV_NAME%" > nul
IF %ERRORLEVEL% EQU 0 (
    echo Environment "%ENV_NAME%" exists.
) ELSE (
    echo Environment "%ENV_NAME%" does not exist.
    exit /b 1
)

REM Activate the environment
echo Activating environment "%ENV_NAME%"...
call conda activate %ENV_NAME%

REM Generate a requirements.txt-like file
SET REQUIREMENTS_FILE=%ENV_NAME%_requirements.txt
echo Generating requirements.txt for environment "%ENV_NAME%"...

REM List the installed packages in the environment and format output to match pip freeze
conda list --export | findstr /v "@" > "%REQUIREMENTS_FILE%"

echo Requirements have been saved to "%REQUIREMENTS_FILE%".
