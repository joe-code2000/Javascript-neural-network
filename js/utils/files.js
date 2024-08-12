
export const save_file = (name,text,type = "application/json") =>{

  if (typeof(text) == "string") {
    // Create element with <a> tag
    const link = document.createElement("a");
  
    // Create a blog object with the file content which you want to add to the file
    const file = new Blob([text], { type: type });
  
    // Add file content in the object URL
    link.href = URL.createObjectURL(file);

    // Add file name
    link.download = `${name}.nxt.json`;
  
    // Add click event to <a> tag to save file.
    link.click();
    URL.revokeObjectURL(link.href);
  }
}

const streamToText = async (blob) => {
  const readableStream = await blob.getReader();
  const chunk = await readableStream.read();

  return new TextDecoder('utf-8').decode(chunk.value);
};

const bufferToText = (buffer) => {
  const bufferByteLength = buffer.byteLength;
  const bufferUint8Array = new Uint8Array(buffer, 0, bufferByteLength);

  return new TextDecoder().decode(bufferUint8Array);
};

export async function readFile(file){
  let data = null
  const fileContent = await file.text();
  data = JSON.parse(fileContent)

  
  return data
}