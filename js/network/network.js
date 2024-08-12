import { save_file } from "../utils/files.js"
import { array_shuffle, generate_binary_decimal_trainset, rand } from "../utils/utils.js"
import { input_visual, output_visual } from "../visuals/input_output.js"
import { layer_element } from "../visuals/layer_visual.js"
import { dom_canvas, generate_path, get_bounds, svg } from "../visuals/visual_utils.js"
import { ACTIVATION_PASS, ACTIVATION_RELU, ACTIVATION_SIGMOID, ACTIVATION_SOFTPLUS, arg_max, LOSS_MSE, LOSS_SE, mean_squared_error, mean_squared_error_derivative, squared_error, squared_error_derivative, TYPE_BASIC, TYPE_SOFTMAX } from "./functions.js"
import { Layer } from "./layer.js"

export const training_label = document.getElementById("training_label")
export const output_label = document.getElementById("output_label")

export class Dense {
    constructor(num_neurons = 1, type = TYPE_BASIC, activation = ACTIVATION_PASS) {
        this.num_neurons = num_neurons
        this.type = type
        this.activation = activation
    }
}

export class Network {
    constructor(array = [], loss_func = LOSS_SE) {
        this.max_neurons_render = 64
        this.denses = array
        this.inputs = []
        this.outputs = []

        this.is_training = false

        this.rate = 1

        this.x_data = []
        this.max_array = []

        this.predictions = []

        this.loss_func = null
        this.loss_func_derivative = null

        this.timeout = (seconds) => {
            return new Promise(resolve => setTimeout(resolve, seconds * 1000))
        }

        switch (loss_func) {
            case LOSS_SE:
                this.loss_func = squared_error
                this.loss_func_derivative = squared_error_derivative
                break;

            case LOSS_MSE:
                this.loss_func = mean_squared_error
                this.loss_func_derivative = mean_squared_error_derivative
                break;

            default:
                log(f`Unknown Loss function ${loss_func}`)
                break;

        }
        this.layers = []

        for (let i = 0; i < array.length; i++) {
            const dense = array[i];

            if (i + 1 == array.length) {
                this.layers.push(new Layer(this, i, dense.num_neurons, dense.type, dense.activation, true))
            } else {
                this.layers.push(new Layer(this, i, dense.num_neurons, dense.type, dense.activation))

            }
        }

        for (let i = 0; i < this.layers.length - 1; i++) {
            const layer = this.layers[i];

            layer.connect_forward(this.layers[i + 1])
        }

        this.render()

        window.onresize = (e) => {
            dom_canvas.innerHTML = ""
            svg.innerHTML = ""
            this.render()
        }

        dom_canvas.onscroll = (e) => {
            dom_canvas.innerHTML = ""
            svg.innerHTML = ""
            this.render()
        }
    }

    train(dataset, epochs = 1, alpha = 1) {

        if (this.layers.length > 0) {
            this.is_training = true
            training_label.innerText = `Training.... `
            let num_epochs = 0
            let num_true = 0
            for (let epoch = 0; epoch < epochs; epoch++) {
                // console.log(`Epoch: ${epoch}`)

                let examples = dataset.get_example()
                const val = examples[0]
                const expect = examples[1]

                for (let i = this.layers.length - 1; 0 <= i; i--) {
                    const layer = this.layers[i];
                    layer.outputs = []
                    layer.normalized_outputs = []
                }

                const input_layer = this.layers[0]
                input_layer.evaluate(val, false, false)
                let output_layer = this.layers[this.layers.length - 1]

                let predicted = output_layer.outputs


                predicted = predicted.map(x => x["result"])

                const backpropagate = this.loss_func_derivative(expect, predicted)

                for (let i = this.layers.length - 1; 0 <= i; i--) {
                    const layer = this.layers[i];
                    layer.back_propagate(backpropagate, alpha)
                }
                num_epochs += 1


                let e_i = arg_max(expect)
                let p_i = arg_max(predicted)

                if (p_i.index == e_i.index) {
                    num_true += 1
                }
            }
            let accuracy = num_true / num_epochs
            console.log(`Accuracy: ${(accuracy)}`)
            training_label.innerText = `Accuracy: ${(accuracy * 100).toFixed(0)}%`

            this.is_training = false
        }

        return false
    }

    async evaluate(x_data = [], rate = 1, show = true) {
        if (show) {
            this.predictions = []
            this.max_array = []
            this.x_data = []
        }

        this.rate = rate
        if (this.layers.length > 0) {

            for (let i = this.layers.length - 1; 0 <= i; i--) {
                const layer = this.layers[i];
                layer.outputs = []
                layer.normalized_outputs = []
            }

            this.x_data = x_data


            for (let i = 0; i < this.inputs.length; i++) {
                const input = this.inputs[i]
                const value = this.x_data[i]

                if (value == 1) {
                    input.classList.add("active_input")
                } else {
                    input.classList.remove("active_input")
                }

                input.innerHTML = `<p>${value.toFixed(2)}<p>`
            }
            const input_layer = this.layers[0]

            if (show) {
                await this.timeout(rate)

            }

            input_layer.evaluate(x_data, false, show)

            let output_layer = this.layers[this.layers.length - 1]

            await this.timeout(this.layers.length * rate)

            let all_neurons = [...document.getElementsByClassName("neuron_div")]

            all_neurons.forEach(neuron => {
                neuron.classList.remove("active_neuron")
            })

            let predicted = output_layer.outputs
            predicted = predicted.map(x => x["result"])
            this.max_array = arg_max(predicted).max_array

            let output_value = 0
            for (let i = 0; i < this.max_array.length; i++) {
                const output = this.outputs[i];
                const value = this.max_array[i]

                if (output != undefined) {
                    if (value == 1) {
                        output.classList.add("active_output")
                    } else {
                        output.classList.remove("active_output")
                    }

                    if (value == 1) {
                        output.innerHTML = `<p>${i + 1}<p>`
                    } else {
                        output.innerHTML = `<p>${i + 1}<p>`
                    }
                }

                if (value == 1) {
                    output_value = i + 1
                }

            }

            output_label.innerText = `Output: ${output_value}`

        }

        return false
    }

    render(parent = dom_canvas) {

        if (this.layers.length > 0) {
            this.inputs = []
            this.outputs = []

            const initial_layer = this.layers[0]


            const input_layer = layer_element("output_layer")
            dom_canvas.appendChild(input_layer)

            const inputs = this.inputs
            if (this.max_neurons_render > -1) {
                for (let i = 0; i < initial_layer.neurons.length; i++) {
                    const input_box = input_visual()
                    input_layer.appendChild(input_box)
                    inputs.push(input_box)

                    if (i + 1 == this.max_neurons_render) {
                        break;
                    }
                }

            } else {
                for (let i = 0; i < initial_layer.neurons.length; i++) {
                    const input_box = input_visual()
                    input_layer.appendChild(input_box)
                    inputs.push(input_box)
                }
            }

            this.layers.forEach(layer => {
                layer.render(parent)
            })

            const predict_layer = this.layers[this.layers.length - 1]

            const output_layer = layer_element("output_layer")
            dom_canvas.appendChild(output_layer)

            const outputs = this.outputs

            if (this.max_neurons_render > -1) {

                for (let i = 0; i < predict_layer.neurons.length; i++) {
                    const output_box = output_visual()
                    output_layer.appendChild(output_box)
                    outputs.push(output_box)
                    if (i + 1 == this.max_neurons_render) {
                        break;
                    }
                }

            } else {
                for (let i = 0; i < predict_layer.neurons.length; i++) {
                    const output_box = output_visual()
                    output_layer.appendChild(output_box)
                    outputs.push(output_box)
                }

            }

            this.layers.forEach(layer => {
                layer.generate_paths()
            })


            if (this.max_neurons_render > -1) {
                for (let i = 0; i < initial_layer.neurons.length; i++) {
                    const neuron = initial_layer.neurons[i];
                    const input_box = inputs[i]
                    generate_path(input_box, neuron.element)
                    if (i + 1 == this.max_neurons_render) {
                        break;
                    }
                }

            } else {

                for (let i = 0; i < initial_layer.neurons.length; i++) {
                    const neuron = initial_layer.neurons[i];
                    const input_box = inputs[i]
                    generate_path(input_box, neuron.element)

                }
            }

            if (this.max_neurons_render > -1) {
                for (let i = 0; i < predict_layer.neurons.length; i++) {
                    const neuron = predict_layer.neurons[i];
                    const output_box = outputs[i]
                    generate_path(neuron.element, output_box)
                    if (i + 1 == this.max_neurons_render) {
                        break;
                    }
                }
            } else {
                for (let i = 0; i < predict_layer.neurons.length; i++) {
                    const neuron = predict_layer.neurons[i];
                    const output_box = outputs[i]
                    generate_path(neuron.element, output_box)

                }

            }


            for (let i = 0; i < this.x_data.length; i++) {
                const input = this.inputs[i];
                const value = this.x_data[i]
                if (input != undefined) {
                    if (value == 1) {
                        input.classList.add("active_input")
                    } else {
                        input.classList.remove("active_input")
                    }

                    input.innerHTML = `<p>${value.toFixed(2)}<p>`
                }
            }

            for (let i = 0; i < this.max_array.length; i++) {
                const output = this.outputs[i];
                const value = this.max_array[i]

                if (output != undefined) {
                    if (value == 1) {
                        output.classList.add("active_output")
                    } else {
                        output.classList.remove("active_output")
                    }

                    if (value == 1) {
                        output.innerHTML = `<p>${i + 1}<p>`
                    } else {
                        output.innerHTML = `<p>${i + 1}<p>`
                    }

                }
            }
        }

    }

    save(name) {
        let save_data = []
        this.layers.forEach(layer => {
            save_data.push(layer.save())
        })
        save_file(name, JSON.stringify(save_data))
    }

    load(data = []) {
        if (data.length != this.layers.length - 1) {
            for (let i = 0; i < data.length; i++) {
                const l_data = data[i];
                const layer = this.layers[i]

                if (l_data.num_neurons != layer.num_neurons) {
                    console.log("Can't not fit model")
                    return
                }
            }
            console.log("Fitting model")
            for (let i = 0; i < data.length; i++) {
                const l_data = data[i];
                const layer = this.layers[i]

                if (l_data.id == layer.id) {
                    layer.load(l_data)
                }
            }

        } else {
            console.log("Can't not fit model")
            return
        }
    }
}

export class Dataset {
    constructor(x_train = [], y_train = []) {
        this.pairs = []

        if (x_train.length == y_train.length) {
            for (let i = 0; i < x_train.length; i++) {
                const x = x_train[i];
                const y = y_train[i];
                this.pairs.push([x, y])
            }
        }
    }

    get_dataset(shuffle = true) {
        if (shuffle) {
            this.pairs = array_shuffle(this.pairs)
        }
        return this.pairs
    }

    get_example(shuffle = true) {
        if (shuffle) {
            this.pairs = array_shuffle(this.pairs)
        }
        return this.pairs[rand(0, this.pairs.length)]
    }
}

