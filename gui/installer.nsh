# installer.nsh

# ✅ 关键：安装前备份 data，安装后恢复
!macro customIint
  # 如果已存在 data，先移到临时位置
  StrCpy $0 "$INSTDIR\word.csv"
  IfFileExists $0 0 +3
    CreateDirectory "$PLUGINSDIR\backup"
    CopyFiles /SILENT "$0" "$PLUGINSDIR\backup\"
    Delete "$0" 
!macroend

!macro customInstall
  # 恢复 data
  StrCpy $0 "$PLUGINSDIR\backup\word.csv"
  IfFileExists $0 0 +3
    CopyFiles /SILENT "$0" "$INSTDIR\"
    RMDir /r "$PLUGINSDIR\backup"
!macroend
