
export const neuron_element = (class_name = "neuron_div", identifier) =>{
  const element = document.createElement("div")
  element.setAttribute("class",class_name);
  element.setAttribute("data-id",identifier);
  element.active = false
  
  return element
}