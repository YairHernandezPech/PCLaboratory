//Aqui obntengo el id del div y lo guardo en una variable
let ContainerPc = document.querySelector("#ContainerPc");
let CantidadPc = 1;
let contDis = CantidadPc;
let contNodis = 0;
let nuevoEstado = " ";
let imgDisponible = "img/pc1.png";
let imgNoDisponible = "img/pcOcupado.png";

let isDraggingImg = false;
let initialXImg, initialYImg;
let selectedImage = null;


//variables para clonar los escritorios
let CantidadTable = 2;
let ContainerTable = document.querySelector("#ContainerTable");


//Funcion para manejar la cantidad de cuadros con el formulario
function ctnPc() {
    try {
        NewvalorImg = document.querySelector("#cndImagenes").value;
        if (NewvalorImg > 0) {
            NewvalorImg = document.querySelector("#cndImagenes").value;
            CantidadPc = NewvalorImg;
            contDis = CantidadPc;
            document.querySelector("#dispnible").innerHTML = "Asientos Disponibles " + CantidadPc;
            document.querySelector("#Nodisponible").innerHTML = "Asientos Fuera de servicio " + 0;

            clonPc();
        } else {
            alert("Ingrese un numero valido")
        }


    } catch (error) {
        console.log(error);
    }

}
// En este function clonamos el imagen original y aumentamos segundo lo que nos digan la variable CantidadPc
function clonPc() {
    try {
        ContainerPc.innerHTML = "";
        contDis = CantidadPc;
        contNodis = 0;

        for (let idpc = 1; idpc <= CantidadPc; idpc++) {
            let clonpc = document.createElement("div");
            clonpc.style.backgroundImage = `url('${imgDisponible}')`;
            clonpc.className = "imgpc";

            let tooltip = document.createElement("span");
            tooltip.className = "tooltip";
            clonpc.appendChild(tooltip);

            clonpc.ondblclick = function () {
                CambioPc(this, idpc);
            }
            ContainerPc.appendChild(clonpc);

            // Recuperar la posición almacenada de la PC desde localStorage
            let storedPosition = localStorage.getItem(`pc-${idpc}-position`);
            if (storedPosition) {
                let position = JSON.parse(storedPosition);
                clonpc.style.left = position.left;
                clonpc.style.top = position.top;
            }

            clonpc.addEventListener('mousedown', function (event) {
                isDraggingImg = true;
                initialXImg = event.clientX - parseFloat(getComputedStyle(clonpc).left);
                initialYImg = event.clientY - parseFloat(getComputedStyle(clonpc).top);
                selectedImage = clonpc;
            });

            clonpc.addEventListener('mouseup', function () {
                isDraggingImg = false;

                // Obtener las coordenadas finales de la PC
                let newXImg = parseFloat(getComputedStyle(clonpc).left);
                let newYImg = parseFloat(getComputedStyle(clonpc).top);

                // Guardar la posición actual de la PC en localStorage
                localStorage.setItem(`pc-${idpc}-position`, JSON.stringify({ left: newXImg + 'px', top: newYImg + 'px' }));

                // Verificar si la PC está sobre una mesa clonada al soltarla
                let pcRect = clonpc.getBoundingClientRect();

                // Iterar sobre las mesas clonadas
                ContainerTable.querySelectorAll('.imgTable').forEach(async table => {
                    let tableRect = table.getBoundingClientRect();

                    // Verificar si las coordenadas de la PC están dentro de la mesa
                    if (
                        pcRect.left >= tableRect.left &&
                        pcRect.right <= tableRect.right &&
                        pcRect.top >= tableRect.top &&
                        pcRect.bottom <= tableRect.bottom
                    ) {
                        await UpdateApi(idpc, table.id);
                    }
                });
            });

            document.addEventListener('mousemove', function (event) {
                if (isDraggingImg && selectedImage === clonpc) {
                    let newXImg = event.clientX - initialXImg;
                    let newYImg = event.clientY - initialYImg;

                    clonpc.style.left = newXImg + 'px';
                    clonpc.style.top = newYImg + 'px';
                }
            });

            consumoAPi(idpc);
        }
    } catch (error) {
        console.log(error);
    }
}




//Esta funcion nos sirve para cambiar de CambioPc
async function CambioPc(imgpc, idpc) {
    try {

        let imgUrl = window.getComputedStyle(imgpc).getPropertyValue("background-image");
        //Aqui comparamos si el CambioPc es igual al que esta por de fault que viene siendo ver entonces se pasar a gris
        if (imgUrl.includes(imgDisponible)) {
            imgpc.style.backgroundImage = `url('${imgNoDisponible}')`;
            imgpc.querySelector(".tooltip").innerHTML = "Asiento fuera de servicio";
            //Si la condicion se cumple al contador contNodis se estara sumando uno por uno y a la variable  contDis se le restara uno por uno
            contNodis++;
            contDis--;
            nuevoEstado = "Asiento Fuera de servicio";


        } else {
            //De caso lo contrario si no es igual a gris pasar a CambioPc verde
            imgpc.style.backgroundImage = `url('${imgDisponible}')`;
            imgpc.querySelector(".tooltip").innerHTML = "Asiento Disponible";
            //Si la condicion se cumple al la variable contNodis se estara restando uno por uno y a la variable  contDis se le sumara uno por uno
            contNodis--;
            contDis++;
            nuevoEstado = "Asiento Disponible";
        }

        //Aqui primero obtenemos el id de los h1 despues agregamos el texto junto con las variables contadores que viene siendo contDis y contNodis
        document.querySelector("#dispnible").innerHTML = "Asientos Disponibles " + contDis;
        document.querySelector("#Nodisponible").innerHTML = "Asientos Fuera de servicio " + contNodis;

        await ActualizarAPi(idpc, nuevoEstado);

    } catch (error) {
        console.log(error);
    }
}



//Funcion para clonar las tables
async function clonTables() {
    try {
        for (let idtable = 1; idtable <= CantidadTable; idtable++) {
            let clonTable = document.createElement("div");
            clonTable.className = "imgTable";
            clonTable.id = idtable;
            clonTable.onclick = async function(){AbrirModal(); await GetApi(clonTable.id);}
            ContainerTable.appendChild(clonTable);
            
        }
    } catch (error) {
        console.log(error);
    }
}
document.addEventListener("DOMContentLoaded", function () {
    clonTables();
});


//Funcion para abrir el modal
function AbrirModal() {
    var modal = document.getElementById("myModal");
    modal.style.display = "block";
}

function cerrarModal() {
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
    window.addEventListener("click", function (event) {
        var modal = document.getElementById("myModal");
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});


//En esta funcion consumo la api luego lo muesto al tooltip segun el id correspontiente a cada cuadrito
async function consumoAPi(idpc) {
    try {
        let url = `http://localhost/api/controller/pc.controller.php/${idpc}`;
        fetch(url)
            .then((res) => res.json())
            .then((data) => mostrarData(idpc, data))
            .catch((error) => console.log(error));

        const mostrarData = async (idpc, data) => {

            if (data.length > 0) {
                let body = "";
                for (let i = 0; i < data.length; i++) {

                    body += `Nombre: ${data[i].nombre} Modelo: ${data[i].modelo} Numero de serie: ${data[i].nserie} Teclado: ${data[i].teclado} Mouse: ${data[i].mouse} Observacion: ${data[i].observacion} id_Estado: ${data[i].id_estado} Estado: ${data[i].estado}`;

                }

                let imagen = document.querySelector(`.imgpc:nth-child(${idpc})`);
                imagen.querySelector('.tooltip').innerHTML = body;
            }

        };
    } catch (error) {
        console.log(error)
    }

}

//Funcion para Actualizar El estado
async function ActualizarAPi(idpc, nuevoEstado) {
    console.log(nuevoEstado);
    const datosActualizacion = {
        estado: nuevoEstado,
    };

    let url = `http://localhost/api/controller/estado.controller.php/${idpc}/${idpc}`;

    try {
        let data = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(datosActualizacion),
        });
        // await consumoAPi()
    } catch (error) {
        console.log(error);
    }
}

//Funcion para consumo de la api escritorio luego lo muestro en el modal
async function GetApi(idtable) {
    try {
        let url = `http://localhost/api/controller/escritorio.controller.php/${idtable}/${idtable}`;
        fetch(url)
            .then((res) => res.json())
            .then((data) => mostrarData(idtable, data))
            .catch((error) => console.log(error));

            async function mostrarData(idtable, data) {
                if (data.length > 0) {
                    let body = "<br><strong>Escritorio:</strong><br>";
                    for (let i = 0; i < data.length; i++) {
                        body += `Nombre: ${data[i].nombre} Descripcion: ${data[i].descripcion} Ubicacion: ${data[i].ubicacion}`;
            
                        // Verificar si hay información de pcs
                        if (data[i].pcs && data[i].pcs.length > 0) {
                            body += "<br><strong>Computadoras:</strong><br>";
                            for (let j = 0; j < data[i].pcs.length; j++) {
                                body += `Nombre: ${data[i].pcs[j].nombre} Modelo: ${data[i].pcs[j].modelo} Numero de serie: ${data[i].pcs[j].nserie}<br>`;
                            }
                        }
                    }
            
                    document.querySelector('.contenido').innerHTML = body;
                }
            }
            

    } catch (error) {
        console.log(error);
    }
}

//Funcion para actualizar el lugar del escritorio

async function UpdateApi(idpc, idtable) {

    let url = `http://localhost/api/controller/escritorio.controller.php/${idtable}/${idpc}`;
    try {

        let data = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            }
        })

    } catch (error) {
        console.log(error);
    }
}