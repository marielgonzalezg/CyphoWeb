import { createClient } from '@supabase/supabase-js';


const supabase = createClient('https://srvyyimzvsztjxisknns.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNydnl5aW16dnN6dGp4aXNrbm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzk3NDAsImV4cCI6MjA3Njk1NTc0MH0.ydcnSJNDs9wXYo_Avq6bZV_e_ikeBNzgqcw6-he_ZXs')


export async function login(email: string, password: string) {
  const emailNorm = email.trim().toLowerCase();
  const { data: users, error } = await supabase
    .from('usuarios')
    .select('correo, contrasena')
    .eq('correo', emailNorm) 
    .limit(1);

  if (error)  return { success: false, message: "Error al buscar usuario" };
  if (!users || users.length === 0) {
    return { success: false, message: "Usuario no encontrado" };
  }

  const user = users[0];

  if (String(user.contrasena) !== String(password)) {
    return { success: false, message: "Contraseña incorrecta" };
  }

  console.log(`✅ Login exitoso: ${user.correo}`);
  return { success: true, message: "Login exitoso" };

}

