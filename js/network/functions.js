import { array_collapse, array_mutate, array_mutate_func, exp, OP_DIV } from "../utils/utils.js"

export const TYPE_BASIC = "TYPE_BASIC"
export const TYPE_SOFTMAX = "TYPE_SOFTMAX"

export const ACTIVATION_PASS = "ACTIVATION_PASS"
export const ACTIVATION_RELU = "ACTIVATION_RELU"
export const ACTIVATION_SIGMOID = "ACTIVATION_SIGMOID"
export const ACTIVATION_SOFTPLUS = "ACTIVATION_SOFTPLUS"

export const LOSS_SE = "LOSS_SE"
export const LOSS_MSE = "LOSS_MSE"


// Activation functions 

export const pass = (data) =>{
  return data
}

export const pass_derivative = () =>{
  return 1
}

export const relu = (number) =>{
  return number > 0 ? number : 0
}

export const relu_derivative = (number) =>{
  return number > 0 ? 1 : 0
}

export const sigmoid = (number) =>{
  return 1/(1 + exp(-number))
}

export const sigmoid_derivative = (number) =>{
  return sigmoid(number)*(1-sigmoid(number))
}

export const softplus = (number) =>{
  return Math.log(1+Math.exp(number))
}

export const softplus_derivative = (number) =>{
  return sigmoid(-number)
}

//Layer Type functions

export const basic = (array = []) =>{
  return array
}

export const softmax = (array = []) =>{
  const total = array_collapse(array,sigmoid)
  
  const result = array_mutate(array_mutate_func(array,sigmoid),total,OP_DIV)

  return result
}

// Loss functions

export const squared_error = (observed = [], predicted = []) =>{

  if (observed.length == predicted.length) {
    const errors = [] 

    for (let i = 0; i < observed.length; i++) {
      const x = observed[i];
      const y = predicted[i];
      
      let result = x - y

      errors.push(Math.pow(result,2)/2)
    }
    return errors
  }
  return null

}


export const squared_error_derivative = (observed = [], predicted = []) =>{
  if (observed.length == predicted.length) {
    const errors = [] 

    for (let i = 0; i < observed.length; i++) {
      const x = observed[i];
      const y = predicted[i];
      
      let result = y - x
      
      errors.push(result)
    }
    return errors
  }

  return null
}

export const mean_squared_error = (observed = [], predicted = []) =>{

  console.log("err")
  if (observed.length == predicted.length) {
    const len = observed.length
    const error_array = []
  
    for (let i = 0; i < observed.length; i++) {
      const x_data = observed[i];
      const y_data = predicted[i];

      let result = x_data - y_data

      result = result**2
      result = result/len
      error_array.push(result)
    }
    return error_array
  }else{
    return null
  }

}

export const mean_squared_error_derivative = (observed = [], predicted = []) =>{

  if (observed.length == predicted.length) {
    const len = observed.length
    const errors = [] 

    for (let i = 0; i < observed.length; i++) {
      const x_data = observed[i];
      const y_data = predicted[i];

      let result = y_data - x_data

      errors.push(result/len)
    }
    return errors
  }else{
    return null
  }

}


export const arg_max = (array = []) =>{
  let max_value = 0
  let max_index = 0

  for (let i = 0; i < array.length; i++) {
    const value = array[i];
    
    if (value > max_value) {
      max_value = value
      max_index = i
    }
  }

  const tmp = []
  for (let i = 0; i < array.length; i++) {
    if (i == max_index) {
      tmp.push(1)
    }else{
      tmp.push(0)
    }
    
  }

  return {"index":max_index,"value":max_value,"max_array":tmp}
}
