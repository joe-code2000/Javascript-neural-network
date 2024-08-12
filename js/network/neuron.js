import { rand } from "../utils/utils.js"
import { neuron_element } from "../visuals/neuron_visual.js"
import { generate_path, get_bounds, svg } from "../visuals/visual_utils.js"

export class Neuron{
  constructor(layer,index){
    
    this.id = `${layer.id} N-${index}`
    this.element = neuron_element("neuron_div",this.id)
    this.bias = rand(-100,100)/100
    this.index = index

    this.network = layer.network
    this.layer = layer
    this.activation_func = layer.activation_func
    this.activation_derivative = layer.activation_derivative

    this.forward_neurons = []
    this.backward_neurons = []

    this.input = 0

    this.output = 0
    this.output_derivative = 0

    this.neuron_derivative = 0
  }

  connect_forward(neurons = []){
    let i = 1
    neurons.forEach(neuron => {
      let data = {
        "neuron":neuron,
        "weight":rand(-100,100)/100,
        "weight_id":`W-${i}`
      }
      this.forward_neurons.push(data)
      neuron.connect_backward(this)

      i++
    })
  }

  connect_backward(neuron){
    this.backward_neurons.push(neuron)
  }

  propagte(data){

    this.input = data

    data = data + this.bias
    const result = this.activation_func(data)

    this.output = result
    if (this.layer.network.is_training) {
      this.output_derivative = this.activation_derivative(result)
    }

    this.forward_neurons.forEach(neuron => {
      const res = neuron.weight*result
      this.layer.outputs.push({"id":this.id,"f_id":neuron.neuron.id,"result":res})
    })
  }

  evaluate(data){
    data = data + this.bias

    this.input = data

    const result = this.activation_func(data)

    this.output = result
    if (this.layer.network.is_training) {
      this.output_derivative = this.activation_derivative(result)
    }

    this.layer.outputs.push({"id":this.id,"f_id":null,"result":result})
    
  }

  back_propagate(values = [],alpha = 1){

    if(this.layer.is_last){
      this.neuron_derivative = values[this.index]*this.output_derivative
    }else{

      if(this.layer.forward_layer.is_last){

        let res = 0
        for (let i = 0; i < this.forward_neurons.length; i++) {
          const f_neuron = this.forward_neurons[i];
          res += f_neuron.neuron.neuron_derivative*f_neuron.weight
        }

        this.neuron_derivative = res*this.output_derivative

        // Calculate bias
        this.bias = this.bias - this.neuron_derivative*alpha

        // Calculate changes in weight

        for (let i = 0; i < this.forward_neurons.length; i++) {
          const f_neuron = this.forward_neurons[i];
          const weight_derivative = f_neuron.neuron.neuron_derivative*this.output
          f_neuron.weight = f_neuron.weight - weight_derivative*alpha
        }

      }else{

        let res = 0

        for (let i = 0; i < this.forward_neurons.length; i++) {
          const f_neuron = this.forward_neurons[i];
          res += f_neuron.neuron.neuron_derivative*f_neuron.weight
        }

        this.neuron_derivative = (res/1)*this.output_derivative

        // Calculate bias
        this.bias = this.bias - this.neuron_derivative*alpha

        for (let i = 0; i < this.forward_neurons.length; i++) {
          const f_neuron = this.forward_neurons[i];
          const weight_derivative = f_neuron.neuron.neuron_derivative*this.output
          f_neuron.weight = f_neuron.weight - weight_derivative*alpha
        }
      }
    }    
  }

  render(parent = this.layer.element){

    if(parent != null && parent != undefined){
      parent.appendChild(this.element)
    }
    this.element.onclick = (e) =>{
      const neurons = [...document.getElementsByClassName("neuron_div")]
      neurons.forEach(neuron => {
        if(neuron != this.element){
          neuron.active = false
        }
      });
      if(this.element.active){
        this.element.active = false
      }else{
        this.element.active = true
        console.log(this)
      }
    }
  }

  generate_paths(){
    this.forward_neurons.forEach(neuron =>{
      const path = generate_path(this.element,neuron["neuron"].element)
      
    })
  }

  show(data){
    
    let res = data["result"] == undefined ? data : data["result"]
    if(res != undefined && res != null){
      this.element.innerHTML = `<p>${res.toFixed(4)}<p>`

    }
  }

  save(){
    let data = {
      "id":this.id,
      "bias":this.bias,
      "forward_neurons":[],
      "output_derivative":this.output_derivative,
      "neuron_derivative":this.neuron_derivative
    }
    
    this.forward_neurons.forEach(f_neuron => {
      let weight_data = {
        "f_neuron_id":null,
        "weight_id":null,
        "weight":null
      }

      weight_data.f_neuron_id = f_neuron["neuron"].id
      weight_data.weight_id = f_neuron["weight_id"]
      weight_data.weight = f_neuron["weight"]

      data.forward_neurons.push(weight_data)
    })
    
    return data
  }

  load(data){
    if (data != null && data != undefined) {
      this.bias = data["bias"]
      this.output_derivative = data["output_derivative"]
      this.neuron_derivative = data["neuron_derivative"]
      for (let i = 0; i < data["forward_neurons"].length; i++) {
        const data_neuron = data["forward_neurons"][i];
        for (let x = 0; x < this.forward_neurons.length; x++) {
          const neuron = this.forward_neurons[x];
          if (neuron.neuron.id == data_neuron["f_neuron_id"]) {
            neuron["weight_id"] = data_neuron["weight_id"]
            neuron["weight"] = data_neuron["weight"]
            break;
          }
        }
      }
    }
  }

  get_forward_neuron(id){
    if (id != null && id != undefined) {
      let f_neuron = null
      for (let i = 0; i < this.forward_neurons.length; i++) {
        const neuron = this.forward_neurons[i];
        if (neuron.id == id) {
          f_neuron = neuron
          break;
        }
      }
      return f_neuron
    }
    return null
  }

}