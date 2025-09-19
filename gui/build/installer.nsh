# installer.nsh

# ✅ 关键：安装前备份 data，安装后恢复
!macro customInit
  StrCpy $0 "$INSTDIR\words.csv"
  IfFileExists $0 0 +3
    ; CreateDirectory "$INSTDIR\..\test"
    CopyFiles  "$0" "$PLUGINSDIR\"
    Delete "$0" 
!macroend

!macro customInstall
  ; CreateDirectory "$INSTDIR\testWhere"
  StrCpy $0 "$PLUGINSDIR\words.csv"
  IfFileExists $0 0 +3
    CopyFiles  "$0" "$INSTDIR\"
    Delete "$0"
!macroend
