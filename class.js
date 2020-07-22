class Usuario
{
  constructor(nombre,apellido,usuario,password,rol,activo,cantRecetas)
  {
      this.nombre = nombre;
      this.apellido = apellido;
      this.usuario = usuario;
      this.password = password;
      this.rol = rol;
      this.activo = activo;
      this.cantRecetas = cantRecetas;
  }
}

class Receta
{
  constructor(id,autor,titulo,foto,tiempo,metodo,likes,dislikes,rendimiento)
  {
      this.id = id;
      this.autor = autor;
      this.titulo = titulo;
      this.foto = foto;
      this.tiempo = tiempo;
      this.metodo = metodo;
      this.likes = likes;
      this.dislikes = dislikes;
      this.rendimiento = rendimiento;
  }
}