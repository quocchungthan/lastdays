@echo off
conda create -n deploymentenv python=3.12.2 -y >> log.txt && conda init cmd.exe >> log.txt