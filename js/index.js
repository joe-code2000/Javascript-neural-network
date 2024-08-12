import "./network/functions.js";
import { ACTIVATION_PASS, ACTIVATION_SIGMOID, LOSS_SE, TYPE_BASIC, TYPE_SOFTMAX } from "./network/functions.js";
import "./network/layer.js";
import "./network/network.js";
import { Dataset, Dense, Network, training_label } from "./network/network.js";
import "./network/neuron.js";
import { decimal_to_binary, generate_binary_decimal_trainset, gen_diagonal_matrix } from "./utils/utils.js";
import { dom_canvas, svg } from "./visuals/visual_utils.js";

let halt = false

const input_size_el = document.getElementById("input_size")
const reset_btn = document.getElementById("reset_btn")

const epochs = document.getElementById("epochs")
const alpha = document.getElementById("alpha")
const train_btn = document.getElementById("train_btn")

let input_size = parseInt(input_size_el.value)
let output_size = Math.pow(2, input_size) - 1

let network = new Network(
    [
        new Dense(input_size),
        new Dense(output_size, TYPE_SOFTMAX)
    ],
    LOSS_SE
)

const evaluate_btn = document.getElementById("evaluate_btn")
const x_data = document.getElementById("x_data")
const rate = document.getElementById("rate")


const name_input = document.getElementById("name")
const save_btn = document.getElementById("save_btn")

const load_input = document.getElementById("load")

x_data.placeholder = `Integer between 1 to ${output_size}`

if (!halt) {
    reset_btn.onclick = (e) => {
        dom_canvas.innerHTML = ""
        svg.innerHTML = ""
        training_label.innerText = `Accuracy: 0%`
        input_size = parseInt(input_size_el.value)
        output_size = Math.pow(2, input_size) - 1

        x_data.placeholder = `Integer between 1 to ${output_size}`

        network = new Network(
            [
                new Dense(input_size),
                new Dense(output_size, TYPE_SOFTMAX)
            ],
            LOSS_SE
        )
    }

    train_btn.onclick = (e) => {
        let train = generate_binary_decimal_trainset(input_size)
        const ep = parseInt(epochs.value)
        const lr = parseFloat(alpha.value)

        halt = network.train(new Dataset(train.x_train, train.y_train), ep, lr)
    }

    evaluate_btn.onclick = (e) => {
        x_data.placeholder = `Integer between 1 to ${output_size}`
        const integer = parseInt(x_data.value)
        const x = decimal_to_binary(input_size)

        const r = parseFloat(rate.value)


        if (x[integer - 1] != undefined) {
            halt = network.evaluate(x[integer - 1], r)
        }
    }

    save_btn.onclick = (e) => {
        if (name_input.value.strip != "") {
            network.save(name_input.value)
        } else {
            alert("Please enter a name for the model")
        }
    }

    load_input.onchange = (e) => {
        const file = e.target.files[0]

        let reader = new FileReader();

        reader.readAsText(file)
        reader.addEventListener("loadend", () => {
            let data = reader.result
            network.load(JSON.parse(data))
        });

        var emptyFile = document.createElement('input');
        emptyFile.type = 'file';

        load_input.files = emptyFile.files;
    }
}


