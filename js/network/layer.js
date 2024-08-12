import { array_combine_values } from "../utils/utils.js"
import { layer_element } from "../visuals/layer_visual.js"
import { ACTIVATION_PASS, ACTIVATION_RELU, ACTIVATION_SIGMOID, ACTIVATION_SOFTPLUS, basic, pass, pass_derivative, relu, relu_derivative, sigmoid, sigmoid_derivative, softmax, softplus, softplus_derivative, TYPE_BASIC, TYPE_SOFTMAX } from "./functions.js"
import { Neuron } from "./neuron.js"

export class Layer{
  constructor(network,index,num_neurons = 0, type = TYPE_BASIC, activation = ACTIVATION_PASS, is_last = false){
    this.element = layer_element()

    this.network = network
    this.index = index
    this.is_last = is_last

    this.id = `L-${index}`

    this.type = type
    this.type_func = null

    switch (type) {
      case TYPE_BASIC:
        this.type_func = basic
        break;
      
      case TYPE_SOFTMAX:
        this.type_func = softmax
        break;

      default:
        console.log("Unknown layer type")
        break;
    }

    this.activation = activation
    this.activation_func = null
    this.activation_derivative = null

    switch (activation) {

      case ACTIVATION_PASS:
        this.activation_func = pass
        this.activation_derivative = pass_derivative
        break;

      case ACTIVATION_RELU:
        this.activation_func = relu
        this.activation_derivative = relu_derivative
        break;

      case ACTIVATION_SIGMOID:
        this.activation_func = sigmoid
        this.activation_derivative = sigmoid_derivative
        break;

      case ACTIVATION_SOFTPLUS:
        this.activation_func = softplus
        this.activation_derivative = softplus_derivative
        break;

      default:
        console.log("Unknown activation function")
        break;
    }

    this.outputs = []
    this.normalized_outputs = []

    this.num_neurons = num_neurons
    this.neurons = []

    for (let i = 0; i < num_neurons; i++) {
      this.neurons.push(new Neuron(this,i))      
    }

    this.forward_layer = null
    this.backward_layer = null
    
  }

  connect_forward(layer){
    this.forward_layer = layer
    layer.connect_backward(this)

    this.neurons.forEach(neuron => {
      neuron.connect_forward(layer.neurons)
    })
  }

  connect_backward(layer){
    this.backward_layer = layer
  }

  async evaluate(values = [], diff = false, show = false){
    
    if (values.length == this.neurons.length) {
      if (show) {
        for (let i = 0; i < values.length; i++) {
          const value = values[i];
          const neuron = this.neurons[i]
          neuron.show(value)
        }

        let all_neurons = [...document.getElementsByClassName("neuron_div")]

        all_neurons.forEach(neuron => {
          if (neuron.attributes["data-id"].value.includes(this.id)) {
            neuron.classList.add("active_neuron")
          }else{
            neuron.classList.remove("active_neuron")
          }
        })

      }
 
      if(!diff){
        for (let i = 0; i < values.length; i++) {
          const value = values[i];
          const neuron = this.neurons[i]
          neuron.propagte(value)
        }

        this.normalized_outputs = this.type_func(array_combine_values(this.outputs,"f_id","result"))

        if(this.forward_layer != null){
          if (show) {
            await this.network.timeout(this.network.rate)
          }
          

          this.forward_layer.evaluate(this.normalized_outputs,true,show)
          
          

        }else{
          for (let i = 0; i < values.length; i++) {
            const value = values[i];
            const neuron = this.neurons[i]
            neuron.evaluate(value)
          }

          const temp = this.type_func(this.outputs.map(x => x["result"]))

          for (let i = 0; i < temp.length; i++) {
            const y = temp[i];
            this.outputs[i]["result"] = y
          }
        }

      }else{
        
        for (let i = 0; i < values.length; i++) {
          const value = values[i];
          const neuron = this.neurons[i]
          neuron.propagte(value["result"])
        }

        this.normalized_outputs = this.type_func(array_combine_values(this.outputs,"f_id","result"))

        if(this.forward_layer != null){
          if (show) {
            await this.network.timeout(this.network.rate)
          }

          this.forward_layer.evaluate(this.normalized_outputs,true,show)
          
        }else{
          for (let i = 0; i < values.length; i++) {
            const value = values[i];
            const neuron = this.neurons[i]
            neuron.evaluate(value["result"])
          }
          const temp = this.type_func(this.outputs.map(x => x["result"]))

          for (let i = 0; i < temp.length; i++) {
            const y = temp[i];
            this.outputs[i]["result"] = y
          }
          
        }
      }


    }else{
      console.log(`Values.shape ${values.length} x 1 Neurons.shape ${this.neurons.shape}`)
    }

  }

  back_propagate(values = [], alpha = 1){
      for (let i = 0; i < this.neurons.length; i++) {
        const neuron = this.neurons[i];
        neuron.back_propagate(values,alpha)
      }
      
  }

  render(parent){
    let max_neurons_render = this.network.max_neurons_render
    if (max_neurons_render > -1) {
      for (let i = 0; i < this.neurons.length; i++) {
        const neuron = this.neurons[i];
        neuron.render(this.element)
        if (i+1 == max_neurons_render) {
          break;
        }
      }
      
    }else{
      this.neurons.forEach(neuron => {
        neuron.render(this.element)
      })
    }
    if(parent != null && parent != undefined){
      parent.appendChild(this.element)
    }
  }

  generate_paths(){
    this.neurons.forEach(neuron => {
      neuron.generate_paths()
    })
  }

  save(){
    let data = {
      "id":this.id,
      "num_neurons":this.num_neurons,
      "neurons": []
    }
    this.neurons.forEach(neuron => {
      data.neurons.push(neuron.save())
    })

    return data
  }

  load(data){
    for (let i = 0; i < data["neurons"].length; i++) {
      const d_neurons = data["neurons"][i];
      const neuron = this.neurons[i]

      if (d_neurons.id == neuron.id) {
        neuron.load(d_neurons)
      }
    }
  }
}