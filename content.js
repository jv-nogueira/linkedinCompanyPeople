/*
// seletor de perfis
var perfil = document.querySelectorAll("li.grid")[i]

    // seletor de perfis + nome
    perfil.querySelectorAll("a")[1].innerText

    // seletor de perfis + title
    perfil.querySelectorAll("a")[1].parentElement.parentNode.children[2].innerText

    // seletor de perfis + link
    perfil.querySelectorAll("a")[1].href

    // seletor de perfis + barra de rolagem automática
    perfil.scrollIntoView()

// Clicar no botão para exibir mais resultados
const buttons = Array.from(document.querySelectorAll('button'));

const target = buttons.find(btn => 
  btn.querySelector('span')?.textContent.includes('Exibir mais resultados')
);

target.click()

*/


var i = 0;
Start();

function Start(){
  // seletor de perfis
  let profile = document.querySelectorAll("li.grid")

  // seletor de perfis + nome
  let name = profile[i].querySelectorAll("a")[1].innerText

  // seletor de perfis + title
  let title = profile[i].querySelectorAll("a")[1].parentElement.parentNode.children[2].innerText

  // seletor de perfis + link
  let link = profile[i].querySelectorAll("a")[1].href

  // seletor de perfis + barra de rolagem automática
  let scroll = profile[i].scrollIntoView()

  // Clicar no botão para exibir mais resultados
  const buttons = Array.from(document.querySelectorAll('button'));

  const target = buttons.find(btn => 
    btn.querySelector('span')?.textContent.includes('Exibir mais resultados')
  );

  console.log(name+" | "+title+" | "+link)
  if (i < profile.length - 4) { 
    i++; 
    setTimeout(Start, 500); 
  }else{
    target.click()
    i++; 
    setTimeout(Start, 8000); 
  };
}