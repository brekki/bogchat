// mobile

$('#popbutton').on("click",()=>{
  $('html').toggleClass("unpopped")
})

$('#sendbutton').on("click",()=>{
  messageinputbox.enter()
  $('#input').focus()
  $('#input').select()
  setTimeout(()=>{
    $('#input').focus()
    $('#input').select()
    messageinputbox.exit()
  },100)
})