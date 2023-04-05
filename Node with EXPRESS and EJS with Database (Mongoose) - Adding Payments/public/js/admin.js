const deleteProduct = (btn) => {
    const prodId  = btn.parentNode.querySelector('[name=productId]').value;    //gives input tag.value ( <input type="hidden" value="<%= products._id %>" name="productId">)
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value; 

    const productElement = btn.closest('article');    //gives you the closest ancestor element to btn

    fetch('/admin/product/' + prodId ,{         //We can fetch() for sending data also
         method: 'DELETE',
         headers: {
            'csrf-token': csrf
         }
    })
    .then(result => {
     return result.json()
    })
    .then(data =>{
        productElement.parentNode.removeChild(productElement)
    })
    .catch(err => console.log(err))           
}