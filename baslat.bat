@echo off
title Ultimate File Converter - Server
color 0b
echo ==================================================
echo          ULTIMATE FILE CONVERTER BASLATILIYOR
echo ==================================================
echo.
echo.
echo Server baslatiliyor...
echo Adres: http://localhost:8081
echo.
echo [!] Sunucuyu kapatmak icin bu pencereyi kapatabilirsiniz.
echo.

python altyapi.py

REM Hata olursa pencere kapanmadan önce pause
if errorlevel 1 (
    echo.
    echo [HATA] Sunucu baslatilirken bir hata olustu!
    echo.
)
pause
