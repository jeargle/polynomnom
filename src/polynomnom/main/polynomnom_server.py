# A simple tornado server

import os.path
import json
from tornado import web, ioloop

# from polynomnom.polynomial.app import urls as polynomial_urls

# Absolute paths
app_path = os.path.split(os.path.abspath(__file__))[0]
pkg_path = os.path.split(app_path)[0]
polynomnom_path = os.path.split(pkg_path)[0]

# Computed paths
global_static = os.path.join(polynomnom_path, os.path.join('lib', 'www', 'static'))
DOC_STATIC = os.path.join(polynomnom_path, 'doc', 'html')


class AppHandler(web.RequestHandler):
    # @web.asynchronous
    def get(self, app, mode):
        if not mode:
            mode = app
        self.render(os.path.join(app, 'html', (mode + '.html')))


class IndexHandler(web.RequestHandler):
    def get(self):
        self.render('html/polynomnom.html')



main_urls = [
    (r'/', IndexHandler),
    (r'/app/(.*)/(.*)', AppHandler),
    (r'/static/(.*)', web.StaticFileHandler, {'path': '../../www/'}),
    (r'/main/(.*)', web.StaticFileHandler, {'path': app_path}),
]

urls = (
    # polynomial_urls +
    main_urls
)

app = web.Application(
    urls,
    debug = True
)



if __name__=='__main__':

    app.listen(8001)
    ioloop.IOLoop.instance().start()
