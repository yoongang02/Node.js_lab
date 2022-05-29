var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

var template = {
  html:function(title, list, body, control){
    return `
    <!doctype html>
    <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
        ${list}
        ${control}
        ${body}
    </body>
    </html>
    `;
  },
  list:function (filelist){
    var list = '<ul>'
    for(var i=0; i<filelist.length; i++){
      list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    }
    list = list+'</ul>'
    return list;
  }
}

function templateHTML(title, list, body, control){
  return `
  <!doctype html>
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB</a></h1>
      ${list}
      ${control}
      ${body}
  </body>
  </html>
  `;
}

function templateList(filelist){
  var list = '<ul>'
  for(var i=0; i<filelist.length; i++){
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
  }
  list = list+'</ul>'
  return list;
}

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url,true).pathname;
    if(pathname === '/'){
      if(queryData.id === undefined){
        fs.readdir('./data', function(error, filelist){
          var title = 'Welcome';
          var description = "Hello, Node.js";
          /*
          var list = templateList(filelist);
          var template = templateHTML(title, list, `<h2>${title}</h2>${description}`,`<a href="/create">create</a>`);

          response.writeHead(200);
          response.end(template);
          */
          var list = template.list(filelist);
          var html = template.html(title, list, `<h2>${title}</h2>${description}`,`<a href="/create">create</a>`);

          response.writeHead(200);
          response.end(html);
          /*
          var list = `</ol>
          <li><a href="/?id=HTML">HTML</a></li>
          <li><a href="/?id=CSS">CSS</a></li>
          <li><a href="/?id=JavaScript">JavaScript</a></li>
          </ol>`;
          */
        });
      }
      else{
          fs.readdir('./data', function(error, filelist){
            template.list(filelist);
            fs.readFile(`data/${queryData.id}`,'utf8',function(err,description){

            var title = queryData.id;
            var list = template.list(filelist);
            var html = template.html(title, list, `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>
            <form action="delete_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <input type="submit" value="delete">
            </form>`);

            response.writeHead(200);
            response.end(html);
          });
        });
      }
    }
    else if(pathname==='/create'){
      fs.readdir('./data', function(error, filelist){
        var title = 'WEB - create';
        var list = template.list(filelist);
        var html = template.html(title, list, `
            <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" rows="8" cols="80" placeholder="content"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
          `,'');

        response.writeHead(200);
        response.end(html);
      });
    }
    else if(pathname==='/create_process'){
      var body = '';
        request.on('data', function (data) {
            body += data;
/*
            if (body.length > 1e6)
                request.connection.destroy();//접속을 끊어버리는 코
*/
        });
        request.on('end', function () {
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;

            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
              response.writeHead(302,{Location: `/?id=${title}`}); //302는 페이지 리다이렉션
              response.end('success');

            })
        });

    }
    else if(pathname === '/update'){
      fs.readdir('./data', function(error, filelist){
        template.list(filelist);
        fs.readFile(`data/${queryData.id}`,'utf8',function(err,description){

        var title = queryData.id;
        var list = template.list(filelist);
        var html = template.html(title, list, `
          <form action="/update_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" rows="8" cols="80" placeholder="content">${description}</textarea>
          </p>
          <p>
            <input type="submit">
          </p>
          </form>
          `,
        `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);

        response.writeHead(200);
        response.end(html);
      });
    });
    }
    else if(pathname==='/update_process'){
      var body = '';
        request.on('data', function (data) {
            body += data;
/*
            if (body.length > 1e6)
                request.connection.destroy();//접속을 끊어버리는 코
*/
        });
        request.on('end', function () {
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;
            console.log(post);

            fs.rename(`data/${id}`,`data/${title}`, function(error){
              fs.writeFile(`data/${title}`, description, 'utf8', function(err){
                response.writeHead(302,{Location: `/?id=${title}`}); //302는 페이지 리다이렉션
                response.end();
              })
            })
            /*
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
              response.writeHead(302,{Location: `/?id=${title}`}); //302는 페이지 리다이렉션
              response.end('success');

            })
            */
        });
    }
    else if(pathname==='/delete_process'){
      var body = '';
        request.on('data', function (data) {
            body += data;
/*
            if (body.length > 1e6)
                request.connection.destroy();//접속을 끊어버리는 코
*/
        });
        request.on('end', function () {
            var post = qs.parse(body);
            var id = post.id;
            fs.unlink(`data/${id}`, function(error){
              response.writeHead(302,{Location: `/`}); //302는 페이지 리다이렉션
              response.end();
            })
        });
    }
    else{
      //response.writeHead(200); //200은 파일을 성공적으로 전달했음.
      response.writeHead(404); //404는 제대로 전달되지 않았을 경우.
      response.end('Not found');
    }
});
app.listen(3000);
