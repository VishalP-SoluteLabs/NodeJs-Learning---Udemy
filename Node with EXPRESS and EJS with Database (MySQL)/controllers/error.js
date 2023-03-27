exports.get404= ((req, res) => {
    res.status(404).render('404', {pageTitle: 'Page Not Found',path: ''});//res.sendFile(path.join(__dirname, 'views', '404.html')); {path.join helps to make root directory as the folder we are working}
}) // after that we can define folder paths one by one and in last the file name