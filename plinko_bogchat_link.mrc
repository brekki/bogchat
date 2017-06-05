on *:TEXT:api*:?: {
  if ($nick = bogchat) {
    if ($sha1($2) === xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx ) {
      if ($3 = msg) {
        .msg $4 $5-
      }
    }
  }
}