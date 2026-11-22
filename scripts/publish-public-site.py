"""Publish generated pages and changed assets over the existing InterServer FTPS connection."""
import ftplib
import io
import os
import re
import ssl
import sys
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import HTTPRedirectHandler, Request, build_opener, urlopen

SOURCE = Path(__file__).resolve().parents[1]
BUILD = Path(sys.argv[1])
STATIC = (
    'assets/fonts/Outfit-OFL.txt', 'assets/fonts/outfit-latin.woff2', 'assets/fonts/outfit-latin-ext.woff2',
    'assets/images/logo-card.webp', 'assets/images/logo-header-animated.webp',
    'assets/images/orlando-custom-tees-share.jpg', 'css/site.css',
    'js/site.js', 'js/language.js', 'js/locale-es.json', 'js/locale-pt.json',
    'js/garment-catalog.js', 'js/gildan-64000.js', 'js/product-banner.js',
)


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *_args, **_kwargs):
        return None


def ensure_directory(ftp, directory):
    for parent in [*reversed(directory.parents), directory]:
        if str(parent) == '.':
            continue
        try:
            ftp.mkd(parent.as_posix())
        except ftplib.error_perm as error:
            if not str(error).startswith('550'):
                raise
            ftp.nlst(parent.as_posix())


def publish():
    suffix = '.upload-' + os.environ['GITHUB_RUN_ID']
    origin = 'https://orlandocustomtees.com'
    files = {Path(name): SOURCE / name for name in STATIC}
    files.update({file.relative_to(BUILD): file for file in BUILD.rglob('*') if file.is_file()})
    config_marker = (SOURCE / 'scripts/public-site.htaccess').read_bytes()
    with ftplib.FTP_TLS(context=ssl.create_default_context(), timeout=30) as ftp:
        ftp.connect(os.environ['FTP_SERVER'], 21)
        ftp.login(os.environ['FTP_USERNAME'], os.environ['FTP_PASSWORD'])
        ftp.prot_p()
        for existing in ('index.html', 'quote.html', 'product.html', 'css/site.css'):
            ftp.size(existing)

        for directory in sorted({path.parent for path in files}):
            ensure_directory(ftp, directory)
        for target, source in files.items():
            with source.open('rb') as content:
                ftp.storbinary('STOR ' + target.as_posix() + suffix, content)
        for target in files:
            ftp.rename(target.as_posix() + suffix, target.as_posix())
        print(f'Published {len(files)} pages and assets')

        config = io.BytesIO()
        ftp.retrbinary('RETR .htaccess', config.write)
        previous = config.getvalue()
        preserved = re.sub(rb'(?ms)^# BEGIN OCT public URLs and static assets\r?\n.*?^# END OCT public URLs and static assets\r?\n?', b'', previous)
        updated = config_marker + b'\n' + preserved
        if updated == previous:
            return

        def write_config(data):
            temporary = '.htaccess' + suffix
            ftp.storbinary('STOR ' + temporary, io.BytesIO(data))
            ftp.rename(temporary, '.htaccess')

        write_config(updated)
        try:
            for path in ('/', '/quote.html', '/products/gildan-64000.html', '/es/', '/pt/'):
                with urlopen(Request(origin + path, headers={'Cache-Control': 'no-cache'}), timeout=15) as result:
                    if result.status != 200:
                        raise RuntimeError(f'Unexpected response for {path}: {result.status}')
            route = '/quote.html?verify=public-urls-' + os.environ['GITHUB_RUN_ID']
            opener = build_opener(NoRedirect)
            for source_origin in ('http://orlandocustomtees.com', 'http://www.orlandocustomtees.com',
                                  'https://www.orlandocustomtees.com'):
                try:
                    opener.open(source_origin + route, timeout=15).close()
                except HTTPError as error:
                    if error.code == 301 and error.headers.get('Location') == origin + route:
                        continue
                    raise
                raise RuntimeError(f'{source_origin} did not return the expected HTTPS redirect')
        except Exception:
            write_config(previous)
            raise
        print('Verified the canonical host and public routes')


if __name__ == '__main__':
    publish()
