export const OP_ADD = "ADD"
export const OP_SUB = "SUB"
export const OP_MUL = "MUL"
export const OP_DIV = "DIV"
export const OP_PWR = "PWR"


export const exp = Math.exp

export const array_collapse = (array = [], func = null) =>{
  let result = 0
  if (func != null) {
    array.forEach(number =>{
      result += func(number)
    })
  }else{
    array.forEach(number =>{
      result += number
    })
  }

  return result
}

export const execute = (num1 = 0, num2 = 0, op = OP_ADD) =>{
  let result = 0

  switch (op) {
    case OP_ADD:
      result = num1 + num2
      break;

    case OP_SUB:
      result = num1 - num2
      break;

    case OP_MUL:
      result = num1 * num2
      break;
    case OP_DIV:
      result = num1 / num2
    break;

    case OP_PWR:
      result = Math.pow(num1,num2)
      break;
  
    default:
      break;
  }

  return result
}

export const array_mutate = (array = [], mutator = 0, op = OP_ADD ) =>{
  let result_array = []

  array.forEach(number =>{
    result_array.push(execute(number,mutator,op))
  })

  return result_array
}

export const array_mutate_func = (array = [], func = null) =>{
  let result_array = []

  if (func != null) {
    array.forEach(number =>{
      result_array.push(func(number))
    })
  }
  return result_array
}

export const rand = (min = -1000, max = 1000) =>{
  return Math.floor(Math.random()*(max-min)+min)
}

export const array_combine_values = (array = [], key = null, value = null) =>{

  if (key != null && value != null) {
    const unique_ids = []

    array.forEach(x => {
      if (!unique_ids.includes(x[key])) {
        unique_ids.push(x[key])
        
      }
    })

    const combined_array = []
    unique_ids.forEach(id =>{
      let result = 0
      let residual = {}
      for (let i = 0; i < array.length; i++) {
        const x = array[i];
        if (x[key] == id) {
          
          result += x[value]
          Object.keys(x).forEach(y=>{
            if (y != key && y != value) {
              if (residual[y] == undefined) {
                residual[y] = []
              }
              residual[y].push((x[y]))
            }
          })

          residual[key] = x[key]
        }

      }
      residual[value] = result
      combined_array.push(residual)
    })

    return combined_array
  }

  return null
}


export const array_shuffle = (array) => {
  let arr = array
  for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
  }

  return arr
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

  return {"index":max_index,"value":max_value}
}

export const x_or_array = (array_1 = [], array_2 = []) =>{
  if (array_1.length == array_2.length) {
    const tmp = []

    for (let i = 0; i < array_1.length; i++) {
      const x = array_1[i];
      const y = array_2[i];
      if(x == 1 && y == 0){
        tmp.push(1)
      }else if (x == 0 && y == 1) {
        tmp.push(1)
      }else{
        tmp.push(0)
      }
    }
    return tmp
  }
  return []
}


export const decimal_to_binary = (decimal) =>{
  let bit_array = []

  for (let i = 0; i < decimal; i++) {
    let tmp = []
    for (let x = 0; x < decimal; x++) {
      if(x == i){
        tmp.push(1)
      }else{
        tmp.push(0)
      }
    }
    let pos = Math.pow(2,i)-1
    bit_array.push(tmp)
    for (let x = 0; x < pos; x++) {
      let res = x_or_array(tmp,bit_array[x])
      if (arg_max(res).value == 1) {
        bit_array.push(res)
      }
    }  
  }

  return bit_array
}


export const gen_diagonal_matrix = (dimension) =>{
  let temp_array = []
  for (let i = 0; i < dimension; i++) {
    let tmp = []
    for (let x = 0; x < dimension; x++) {
      if(x == i){
        tmp.push(1)
      }else{
        tmp.push(0)
      }
    }
    temp_array.push(tmp)
  }

  return temp_array
}

export const generate_binary_decimal_trainset = (decimal) => {
  const x_data = decimal_to_binary(decimal)
  const dimension = Math.pow(2,decimal)-1
  const y_data = gen_diagonal_matrix(dimension)

  let x_data_str = ""

  x_data.forEach(x=>{
    x_data_str += `[${x}]`
    x_data_str += "\n"
  })

  let y_data_str = ""

  y_data.forEach(y=>{
    y_data_str += `[${y}]`
    y_data_str += "\n"
  })

  return {"x_train":x_data,"x_train_str":x_data_str,"y_train":y_data,"y_train_str":y_data_str}
}