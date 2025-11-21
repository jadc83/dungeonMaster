<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ObjetoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $objetos_1920s = [
            // Tecnología y Comunicaciones
            [
                'denominacion' => 'Radio de Válvulas (Mueble)',
                'descripcion' => 'Aparato receptor de radio de gran tamaño, mueble de madera de nogal, popular para escuchar jazz.',
                'valor' => 120.00, // Artículo de lujo para el hogar
            ],
            [
                'denominacion' => 'Máquina de Escribir Portátil',
                'descripcion' => 'Modelo compacto de máquina de escribir Remington, con estuche de transporte.',
                'valor' => 55.00,
            ],
            [
                'denominacion' => 'Cámara Kodak Brownie',
                'descripcion' => 'Cámara popular de bajo coste que usaba película en rollo, muy accesible para el público general.',
                'valor' => 5.50,
            ],
            [
                'denominacion' => 'Disco de Pizarra (78 RPM)',
                'descripcion' => 'Grabación de una canción de Jazz o Foxtrot, utilizada en el fonógrafo.',
                'valor' => 0.75,
            ],
            [
                'denominacion' => 'Teléfono de Baquelita Negro',
                'descripcion' => 'Aparato de sobremesa con disco de marcación giratorio.',
                'valor' => 30.00,
            ],

            // Utensilios, Cocina y Hogar
            [
                'denominacion' => 'Juego de Té Art Déco',
                'descripcion' => 'Tetera, azucarero y lechera de porcelana con decoración geométrica en dorado.',
                'valor' => 45.90,
            ],
            [
                'denominacion' => 'Tostador Eléctrico de Resistencia',
                'descripcion' => 'Uno de los primeros modelos de tostador eléctrico, calienta las rebanadas por fuera.',
                'valor' => 8.50,
            ],
            [
                'denominacion' => 'Aspiradora "Hoover" de Mano',
                'descripcion' => 'Pequeño electrodoméstico para la limpieza del hogar, un signo de modernidad.',
                'valor' => 25.00,
            ],
            [
                'denominacion' => 'Navaja de Afeitar de Seguridad',
                'descripcion' => 'Máquina de afeitar con cuchillas desechables, popularizada por Gillette.',
                'valor' => 1.25,
            ],
            [
                'denominacion' => 'Bote de Polvos de Talco (Poudre)',
                'descripcion' => 'Envase de metal con polvos perfumados, cosmético esencial para las mujeres.',
                'valor' => 3.20,
            ],
            [
                'denominacion' => 'Abrecartas de Marfil',
                'descripcion' => 'Elegante utensilio para abrir la correspondencia, a menudo un regalo de oficina.',
                'valor' => 9.99,
            ],

            // Moda y Accesorios (Flapper/Caballero)
            [
                'denominacion' => 'Sombrero Campana (Cloche)',
                'descripcion' => 'Sombrero ajustado a la cabeza, de fieltro, esencial para la moda femenina de la década.',
                'valor' => 18.00,
            ],
            [
                'denominacion' => 'Boquilla Larga para Cigarrillos',
                'descripcion' => 'Accesorio elegante, de ébano o hueso, usado por las Flappers.',
                'valor' => 4.00,
            ],
            [
                'denominacion' => 'Tirantes de Caballero',
                'descripcion' => 'Tirantes de seda o tela elástica para sostener los pantalones de cintura alta.',
                'valor' => 7.50,
            ],
            [
                'denominacion' => 'Estuche de Polvera Compacta',
                'descripcion' => 'Estuche metálico y grabado con un pequeño espejo para retoques de maquillaje.',
                'valor' => 15.00,
            ],
            [
                'denominacion' => 'Guantes Largos de Seda',
                'descripcion' => 'Guantes que llegan hasta el codo, usados para eventos sociales formales.',
                'valor' => 11.00,
            ],

            // Miscelánea y Herramientas
            [
                'denominacion' => 'Linterna de Mano de Latón',
                'descripcion' => 'Linterna cilíndrica a pilas, para uso doméstico y en automóviles.',
                'valor' => 4.50,
            ],
            [
                'denominacion' => 'Juego de Herramientas de Automóvil',
                'descripcion' => 'Llaves inglesas, alicates y destornilladores necesarios para reparar un Ford T.',
                'valor' => 28.00,
            ],
            [
                'denominacion' => 'Periódico (Edición Dominical)',
                'descripcion' => 'Ejemplar del diario que incluye noticias y suplementos de ocio.',
                'valor' => 0.10,
            ],
        ];

        // Mapear y añadir timestamps a todos los objetos
        $data = array_map(function ($item) {
            $item['created_at'] = now();
            $item['updated_at'] = now();
            $item['descripcion'] = $item['descripcion'] ?? '';
            return $item;
        }, $objetos_1920s);

        // Insertar todos los datos en la tabla
        DB::table('objetos')->insert($data);
    }
}
