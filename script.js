$(document).ready(init);

let recetas = [];
let usuarios = [];
let usuarioLogueado = null;

function init() {
  //asegura que el completado de las forms no recargue la página 
  $("form").submit(function(e) {
    e.preventDefault();
  });

  precargaUsuarios();
  precargaRecetas();
  popularRecetas();
  popularTabla();

  vistaPublico();
  $("#submitBusqueda").click(busqueda);
  $("#logoBtn").click(vistaPublico);
  $("#admin").click(vistaAdmin);

  $("#submitLogin").click(submitLogin);
  $("#submitUser").click(submitUsuario);
  $("#submitReceta").click(submitReceta);
  $("#logOut").click(vistaPublico);

}

//Funciones relacionadas al manejo de interfaz

function cerrarSesion(){
  usuarioLogueado = null;
  barraAdmin();
  vistaPublico();
}

function vistaPublico() {
  popularRecetas();
  $("#mostrarRecetas").show();
  $("#resultados").hide();
  $("#adminPanel").hide();
}

function vistaAdmin() {
  if (usuarioLogueado == null) {
    $("#loginModal").modal('show');
  }
  else { 
    tablaLikes();
    tablaDislikes();
    $("#mostrarRecetas").hide();
    $("#resultados").hide();
    $("#adminPanel").show();
    barraAdmin();
    $('html, body').animate({ scrollTop: 0 }, 'fast');
    if(usuarioLogueado.rol != "chef"){
      $("#colaboradores").hide();
    }
    if(usuarioLogueado.rol == "chef"){
      $("#colaboradores").show();
    }
  }
}

function mostrarBusqueda() {
  $("#mostrarRecetas").hide()
  $("#resultados").show();
}

//funciones de submit

function submitLogin() {
  let user = $("#loginUser").val();
  let pwd = $("#loginPwd").val();
  if (validacionLogin(user, pwd)) {
    usuarioLogueado = buscarUsuario(user);
    $('#loginModal').modal('hide');
    vistaAdmin();
  }
  else{
    mostrarError();
  }
}

function submitUsuario() {

  let nombre = $("#nombreNuevoUsuario").val();
  let apellido = $("#apellidoNuevoUsuario").val();
  let username = (nombre.charAt(0) + apellido).toLowerCase();
  let password = (nombre.charAt(0) + '-' + apellido).toLowerCase();
  let contador = repetidos(username);
  if(contador > 0){
    username += contador;
  }
  let rol = "colaborador";
  let activo = true;
  if (nuevoUsuario(nombre, apellido, username, password, rol, activo)) {
    $("#datosNuevoUsuario").html("Nombre de usuario: " + username + "<br> Contraseña: " + password);
    $('#modalNuevoUsuario').modal('hide');
    $("#confirmacionNuevoUsuario").modal('show');
    popularTabla()
  }
  else{
    mostrarError();
  }
}

function submitReceta() {
  let id = recetas.length;
  let autor = usuarioLogueado;
  let titulo = $("#tituloReceta").val();
  let tiempo = parseInt($("#tiempoReceta").val());
  let metodo = $("#procedimientoReceta").val();
  let foto = $("#imagenReceta").val();
  let likes = 0;
  let dislikes = 0;
  if (nuevaReceta(id, autor, titulo, foto, tiempo, metodo, likes, dislikes) == true) {
    $('#modalNuevaReceta').modal('hide');
    $("#textoConfirmacionReceta").html('La receta "' + titulo + '" fue publicada con éxito');
    $("#confirmacionReceta").modal('show');
    calcularRendimiento();
  }
  else{
    mostrarError(); 
  }
}

//funciones para el armado de la interfaz

function popularTabla() {
  $("#tablaUsuarios").html("")
  let tabla = "";
  contarRecetas();
  for (var i = 1; i < usuarios.length; i++) { //i inicia en 1 porque el chef (usuarios[0]) no es colaborador
    var tr = "<tr>";
    tr += "<td>" + usuarios[i].usuario + "</td>";
    tr += "<td>" + usuarios[i].nombre + "</td>";
    tr += "<td>" + usuarios[i].apellido + "</td>";
    tr += "<td>" + usuarios[i].cantRecetas + "</td>";
    if (usuarios[i].activo == true) {
      tr += '<td class="text-success"> <strong>Habilitado</strong> </td>';
      tr += '<td><span id="d-' + usuarios[i].usuario + '" title="Deshabilitar" class="btn trigger-btn" data-toggle="tooltip"><i class="material-icons text-danger">remove_circle</i></span></td>';
    }
    if (usuarios[i].activo == false){
      tr += '<td class="text-secondary"> <strong>Deshabilitado</strong> </td>';
      tr += '<td><span id="h-' + usuarios[i].usuario + '" title="Habilitar" class="btn trigger-btn" data-toggle="tooltip"><i class="material-icons text-success">check_circle</i></span></td>';
    }
    tr += "</tr>";
    tabla += tr;
  }
  $("#tablaUsuarios").html($("#tablaUsuarios").html() + tabla);
  $("#tablaUsuarios span").on("click", habilitar);
}

function popularRecetas(){
  $("#mostrarRecetas").html("");
  let listadoRecetas = "";
  for (i = 0; i < recetas.length; i++) {
    let autorReceta = recetas[i].autor;
    let receta = buscarReceta(recetas[i].id);
    if(autorReceta.activo){
      let foto = receta.foto;
      let titulo = receta.titulo;
      let autor = autorReceta.nombre + " " + autorReceta.apellido;
      let tiempo = receta.tiempo;
      let likes = receta.likes;
      let dislikes = receta.dislikes;
      let id = receta.id;
      let metodo = receta.metodo;
      listadoRecetas += articuloReceta(foto, titulo, autor, tiempo, likes, dislikes, id, metodo);
    }
  }
  $("#mostrarRecetas").html($("#mostrarRecetas").html() + listadoRecetas);
  $("#mostrarRecetas button").on("click", puntuar);
}

function busqueda(){
  $("#busquedaCuerpo").html("");
  let busquedaInput = $("#searchField").val();
  let listadoRecetas = "";
  let errorBusqueda = "";
  let encontro = false;
  busquedaInput = busquedaInput.toLowerCase();
  for (i = 0; i < recetas.length; i++) {
    let autorReceta = recetas[i].autor;
    let receta = buscarReceta(recetas[i].id);
    let titulo = receta.titulo.toLowerCase();
    let metodo = receta.metodo.toLowerCase();
    let busquedaTitulo = titulo.includes(busquedaInput);
    let busquedaMetodo = metodo.includes(busquedaInput);
    if(busquedaTitulo || busquedaMetodo){
      encontro = true;
      let foto = receta.foto;
      let titulo = receta.titulo;
      let autor = autorReceta.nombre + " " + autorReceta.apellido;
      let tiempo = receta.tiempo;
      let likes = receta.likes;
      let dislikes = receta.dislikes;
      let id = receta.id;
      let metodo = receta.metodo;
      listadoRecetas += articuloReceta(foto, titulo, autor, tiempo, likes, dislikes, id, metodo);
    }
  }
  if(encontro == false){
    errorBusqueda = `
    <div>
      <h4>No se han encontrado resultados</h4>
    </div>`;

  }
  $("#busquedaCuerpo").html($("#busquedaCuerpo").html() + listadoRecetas + errorBusqueda);
  mostrarBusqueda();
}

function articuloReceta(foto, titulo, autor, tiempo, likes, dislikes, id, metodo){
  let articuloReceta2 = `
        <div> 
          <div>
            <img class="recetaFoto" src="images/${foto}" />
          </div>
          <div>
            <h2 class="recetaTitulo">${titulo}</h2>
          </div>
          <div class="card bg-light contenedorAutor">
            <div class="card-body row">
              <div class="col-sm-4">
                <p>
                <i class="material-icons" aria-hidden="true">person</i>
                ${autor}
                </p>
              </div>
              <div class="col-sm-4">
                <p>
                <i class="material-icons" aria-hidden="true">timer</i>
                ${tiempo} minutos
                </p>
              </div>
              <div class="col-sm-4">
                  <p>
                    ${likes}
                    <button id="l-${id}"type="button" class="btn btn-sm "><i class="material-icons" aria-hidden="true">thumb_up</i></button>
                    <button id="d-${id}"type="button" class="btn btn-sm "><i class="material-icons" aria-hidden="true">thumb_down</i></button>
                    ${dislikes}
                  </p>
              </div>
            </div>
          </div>
          <div>
            <p class="recetaMetodo">${metodo}</p>
          </div>
        </div>
        <hr>
        `;
        return articuloReceta2;
}

function barraAdmin(){
  if(usuarioLogueado != null){
    $("#barraUsuarioLogueado").show();
    let barraUsuarioLogueado = "";
    let autor = usuarioLogueado.nombre;
    let barra = `
      <div class="animated fadeInDownBig">
        <div class="container">
          <div class="row">
            <div class="col-sm-8">
              <p>
                Bienvenido, <strong>${autor}</strong>
              </p>
            </div>
            <div class="col-sm-4">
              <button type="button" class="btn btn-secondary" id="logOut">Cerrar sesión</button>
            </div>
          </div>
        </div>
      </div>    
      `;
    barraUsuarioLogueado += barra;
    $("#barraUsuarioLogueado").html(barraUsuarioLogueado);
    $("#logOut").click(cerrarSesion);
  }
  else{
    $("#barraUsuarioLogueado").hide();
  }
}

//funciones de precarga

function precargaUsuarios() { //sólo se ven las recetas del chef. habilitar antes de la entrega
  nuevoUsuario("Pedro", "Pérez", "chef", "chef-01", "chef", true);
  nuevoUsuario("Maria", "López", "mlopez", "m-lopez", "colaborador", true);
  nuevoUsuario("José", "Rodríguez", "jrodriguez", "j-rodriguez", "colaborador", false);
  nuevoUsuario("Mateo", "Bacci", "mbacci", "m-bacci", "colaborador", false);
  nuevoUsuario("Juana", "Luppi", "jluppi", "j-luppi", "colaborador", false);
}

function precargaRecetas() {
  nuevaReceta(1, usuarios[0], 'Torta frita', 'tortas_fritas.jpg', 120, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris efficitur augue vel elit lobortis, sed ultricies velit venenatis. Ut vel molestie sed.',10,5);
  nuevaReceta(2, usuarios[2], "Hamburguesas Rellenas", 'hamburguesa-rellena.jpg', 180, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris efficitur augue vel elit lobortis, sed ultricies velit venenatis. Ut vel molestie sed.',8,3);
  nuevaReceta(3, usuarios[0], "Pastel de Papa y Hongos", 'pastel-papas-hongos.jpg', 120, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris efficitur augue vel elit lobortis, sed ultricies velit venenatis. Ut vel molestie sed.',10,1);
  nuevaReceta(4, usuarios[1], "Galletas de avena y pasas", 'galletas-avena-pasas.jpg', 90, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris efficitur augue vel elit lobortis, sed ultricies velit venenatis. Ut vel molestie sed.',20,0);
  nuevaReceta(5, usuarios[4], "Lemon pie facilito", 'lemon-pie.jpg', 120, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris efficitur augue vel elit lobortis, sed ultricies velit venenatis. Ut vel molestie sed.',8,20);
  nuevaReceta(6, usuarios[3], "Arroz con leche", 'Arroz-con-leche.jpg', 60, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris efficitur augue vel elit lobortis, sed ultricies velit venenatis. Ut vel molestie sed.',0,0);
  nuevaReceta(7, usuarios[0], "Pastel de carne", 'pastel-carne.png', 90, 'Hola ipsum dolor sit amet, consectetur adipiscing elit. Mauris efficitur augue vel elit lobortis, sed ultricies velit venenatis. Ut vel molestie sed.',0,0);
  nuevaReceta(8, usuarios[2], "Ñoquis de papa", 'ñoquis.jpg', 150, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris efficitur augue vel elit lobortis, sed ultricies velit venenatis. Ut vel molestie sed.',0,0);
  nuevaReceta(9, usuarios[3], "Strogonoff de pollo", 'strogonoff.jpg', 100, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris efficitur augue vel elit lobortis, sed ultricies velit venenatis. Ut vel molestie sed.',0,0);
  nuevaReceta(10, usuarios[4], "Pollo crispy", 'pollo-crispy.jpg', 90, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris efficitur augue vel elit lobortis, sed ultricies velit venenatis. Ut vel molestie sed.',10,0);
  nuevaReceta(11, usuarios[2], "Pizza", 'pizza.jpg', 160, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris efficitur augue vel elit lobortis, sed ultricies velit venenatis. Ut vel molestie sed.',0,0);
  nuevaReceta(12, usuarios[3], "Crepes de vegetales", 'crepes-vegetales.jpg', 120, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris efficitur augue vel elit lobortis, sed ultricies velit venenatis. Ut vel molestie sed.',9,0);
  nuevaReceta(13, usuarios[4], "Tortilla de calabacín", 'tortilla-calabacin.jpg', 30, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris efficitur augue vel elit lobortis, sed ultricies velit venenatis. Ut vel molestie sed.',0,0);
  nuevaReceta(14, usuarios[1], "Ensalada César", 'ensalada-cesar.jpg', 150, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris efficitur augue vel elit lobortis, sed ultricies velit venenatis. Ut vel molestie sed.',0,8);
  nuevaReceta(15, usuarios[3], "Pastel de queso", 'pastel-queso.jpg', 120, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris efficitur augue vel elit lobortis, sed ultricies velit venenatis. Ut vel molestie sed.',0,0);
  nuevaReceta(16, usuarios[1], "Berenjenas rellenas", 'berenjenas-rellenas.jpg', 120, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris efficitur augue vel elit lobortis, sed ultricies velit venenatis. Ut vel molestie sed.',0,0);
  nuevaReceta(17, usuarios[0], "Langostinos al horno", 'langostinos-horno.jpg', 90, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris efficitur augue vel elit lobortis, sed ultricies velit venenatis. Ut vel molestie sed.',20,0);
  nuevaReceta(18, usuarios[1], "Arroz con garbanzos al horno", 'arroz-garbanzos.jpg', 60, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris efficitur augue vel elit lobortis, sed ultricies velit venenatis. Ut vel molestie sed.',15,0);
  nuevaReceta(19, usuarios[2], "Bacalao al horno con almejas y gambas", 'bacalao.jpg', 60, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris efficitur augue vel elit lobortis, sed ultricies velit venenatis. Ut vel molestie sed.',0,0);
  nuevaReceta(20, usuarios[1], "Magdalenas caseras", 'magdalenas.jpg', 90, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris efficitur augue vel elit lobortis, sed ultricies velit venenatis. Ut vel molestie sed.',0,0);

}

//funciones de manipulación de objetos

function nuevoUsuario(nombre, apellido, username, password, rol, activo) {
  let exito = false;
  if (validacionUsuario(nombre, apellido, username, password, rol, activo)) {
    let usuario = new Usuario(nombre, apellido, username, password, rol, activo);
    usuarios.push(usuario);
    exito = true;
    //popularTabla();
  }
  return exito;
}

function nuevaReceta(id, autor, titulo, foto, tiempo, metodo, likes, dislikes) {
  let exito = false;
  if (validacionReceta(id, autor, titulo, foto, tiempo, metodo)==true) {
    let receta = new Receta(id, autor, titulo, foto, tiempo, metodo, likes, dislikes);
    recetas.push(receta);
    exito = true;
    //popularTabla()

  }
  return exito;
}


//funciones de validación

function validacionLogin(user, pwd) {
  let datosValidados = false;

  for (let i = 0; i < usuarios.length; i++) {
    if (user == usuarios[i].usuario && pwd == usuarios[i].password && usuarios[i].activo) {
      datosValidados = true;
      break;
    }
  }
  return datosValidados;
}

function validacionUsuario(nombre, apellido) {
  let datosValidados = true;
  if (nombre.length <= 1 || nombre.length > 50) {   //Valido que los campos no estén vacíos
    datosValidados = false;
  }
  if (apellido.length <= 1 || apellido.length > 50) {   // y que no superen los 50 caracteres
    datosValidados = false;
  }
  return datosValidados;
}

function validacionReceta(id, autor, titulo, foto, tiempo, metodo) {
  let validacion = true;
  if (titulo.length == 0 || titulo.length > 50) {
    validacion = false;
  }
  if (foto == null) {
    validacion = false;
  }
  if (tiempo == 0 || tiempo > 1440) {
    validacion = false;
  }
  if (metodo.length == 0 || metodo.length > 150) {
    validacion = false;
  }
  return validacion;
}

//funciones auxiliares

function buscarUsuario(user){
  let autor = null;
  for(i = 0; i < usuarios.length; i++){
    if (user == usuarios[i].usuario){
      autor = usuarios[i];
      break;
    }
  }
  return autor;
}

function buscarReceta(id){
  let receta = null;
  for(i = 0; i < recetas.length; i++){
    if (id == recetas[i].id){
      receta = recetas[i];
      break;
    }
  }
  return receta;
}

function contarRecetas(){
  for(i = 0; i < usuarios.length; i++){
    let autor = buscarUsuario(usuarios[i].usuario)
    for(x = 0, contador = 0; x < recetas.length; x++){

      if(recetas[x].autor == autor){
        contador++;
      }
      autor.cantRecetas = contador; 
    }
  }
}

function calcularRendimiento(){
  for(i = 0; i < recetas.length; i++){
    if(recetas[i].likes + recetas[i].dislikes > 0){
      let likes = parseInt(recetas[i].likes,10);
      let dislikes = parseInt(recetas[i].dislikes,10)
      recetas[i].rendimiento = Math.round(likes * 100 / (likes + dislikes));

    }
    else{
      recetas[i].rendimiento = 0
    }
  }
}

function habilitar(){
  let ide = $(this).attr("id");
  for(i = 0; i < usuarios.length; i++){
    if(usuarios[i].usuario == ide.substring(2) && ide.charAt(0) == "d"){
      usuarios[i].activo = false;
    }
    if(usuarios[i].usuario == ide.substring(2) && ide.charAt(0) == "h"){
      usuarios[i].activo = true;
    }
  }
  popularTabla();
}

function puntuar(){
  let ide = $(this).attr("id");
  for(i = 0; i < recetas.length; i++){
    if(recetas[i].id == ide.substring(2) && ide.charAt(0) == "l"){
      recetas[i].likes++;
    }
    if(recetas[i].id == ide.substring(2) && ide.charAt(0) == "d"){
      recetas[i].dislikes++;
    }
  }
  calcularRendimiento();
  popularRecetas()
}

function repetidos(user){
  let contador = 0;
  for(i = 0; i < usuarios.length; i++){
    if(user == usuarios[i].usuario){
      contador += 1;
    }
  }
  return contador;
}

function mostrarError(){
  let errorMsg =`
  <div style="padding: 5px;">
    <div id="inner-message" class="alert alert-danger alert-dismissible fade show" >
      <button type="button" class="close" data-dismiss="alert">&times;</button>
      Datos inválidos
    </div>
  </div>
  `
  $("#error").html(errorMsg);
}

//funciones reporte likes

let topRecetasLikes = [];
let topRecetasDislikes = [];

function tablaLikes() {
  $("#tablaLikes").html("");
  mejorPuntuadas();
  let tabla = "";
  for (i = 0; i < topRecetasLikes.length; i++){
    let id = topRecetasLikes[i].id;
    let titulo = topRecetasLikes[i].titulo;
    let likes = topRecetasLikes[i].likes;
    let rendimiento = topRecetasLikes[i].rendimiento;
    tabla += popularFila(id, titulo, likes, rendimiento);
  }
  $("#tablaLikes").html($("#tablaLikes").html() + tabla);
}

function tablaDislikes() {
  $("#tablaDislikes").html("");
  peorPuntuadas();
  let tabla = "";
  for (i = 0; i < topRecetasDislikes.length; i++){
    let id = topRecetasDislikes[i].id;
    let titulo = topRecetasDislikes[i].titulo;
    let dislikes = topRecetasDislikes[i].dislikes;
    let rendimiento = topRecetasDislikes[i].rendimiento;
    tabla += popularFila(id, titulo, dislikes, rendimiento);
  }
  $("#tablaDislikes").html($("#tablaDislikes").html() + tabla);
}


function popularFila(id, titulo, votos, rendimiento){
    var fila = "<tr>";
    fila += "<td>" + id + "</td>";
    fila += "<td>" + titulo + "</td>";
    fila += "<td>" + votos + "</td>";
    fila += "<td>" + rendimiento + "%</td>";
    fila += "</tr>";
    return fila;
}


function mejorPuntuadas()
{
  calcularRendimiento();
  let recetasFiltradasLikes = recetas.sort(function (a,b){if(a.rendimiento < b.rendimiento){return 1;}else if (a.rendimiento == b.rendimiento){return 0;}else {return (-1);}});
  topRecetasLikes = [recetasFiltradasLikes[0],recetasFiltradasLikes[1],recetasFiltradasLikes[2]];
  return topRecetasLikes;
}
function peorPuntuadas()
{
  calcularRendimiento();
  let recetasFiltradasDislikes = recetas.sort(function (a,b){if(a.rendimiento > b.rendimiento){return 1;}else if (a.rendimiento == b.rendimiento){return 0;}else {return (-1);}});
  topRecetasDislikes = [recetasFiltradasDislikes[0],recetasFiltradasDislikes[1],recetasFiltradasDislikes[2]];
  return topRecetasDislikes;
}    