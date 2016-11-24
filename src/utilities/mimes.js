/**
 * -----------------------------------------------------------
 * 
 * mimes, map of MIME types
 * 
 * -----------------------------------------------------------
 */


'use strict';


module.exports = {
    // general
    'text':        'text/*',
    'image':       'image/*',
    'audio':       'audio/*',
    'video':       'video/*',
    'application': 'application/*',

    // text
    'html':   'text/html',
    'htm':    'text/html',
    'js':     'text/javascript',
    'css':    'text/css',
    'md':     'text/markdown',
    'rt':     'text/richtext',
    'rtf':    'text/richtext',
    'tsv':    'text/tab-separated-values',
    'sh':     'text/x-script.sh',
    'log':    'text/plain',
    'txt':    'text/plain',

    // images
    'ico':    'image/x-icon',
    'png':    'image/png',
    'jpg':    'image/jpeg',
    'jpeg':   'image/jpeg',
    'gif':    'image/gif',
    'svg':    'image/svg+xml',
    'tiff':   'image/tiff',

    // audio
    'wav':    'audio/wav',
    'mp3':    'audio/mpeg',
    'flac':   'audio/flac',
    'm4a':    'audio/mp4',

    // video
    'ogv':    'video/ogg',
    'ogg':    'video/ogg',
    'oga':    'audio/ogg',
    'mpeg':   'video/mpeg',
    'mov':    'video/quicktime',
    'webm':   'video/webm',
    'mkv':    'video/webm',
    'flv':    'video/x-flv',
    'wmv':    'video/x-ms-wmv',
    'avi':    'video/x-msvideo',
    'm4v':    'video/mp4',
    'mp4':    'video/mp4',

    // application
    'json':   'application/json',
    'xml':    'application/xml',
    'pdf':    'application/pdf',
    'doc':    'application/msword',
    'word':   'application/msword',
    'ppt':    'application/powerpoint',
    'book':   'application/book',
    'tar.gz': 'application/x-tar',
    'tgz':    'application/x-tar',
    'zip':    'application/zip',
    'exe':    'application/octet-stream',
    'dmg':    'application/octet-stream',
    'dll':    'application/octet-stream',
    'iso':    'application/octet-stream',
    'msi':    'application/octet-stream',
    'exe':    'application/octet-stream',
    'pkg':    'application/octet-stream',
    'img':    'application/octet-stream',
    'bin':    'application/octet-stream',
    'buffer': 'application/octet-stream',

    'ai':     'application/postscript',
    'eps':    'application/postscript',
    'ps':     'application/postscript',
    'fw':     'application/postscript',

    // fonts
    'ttf':    'application/x-font-ttf',
    'otf':    'application/x-font-otf',
    'woff':   'application/font-woff',
    'eot':    'application/vnd.ms-fontobject',

    // gzip
    'gzip':   'multipart/x-gzip'
};

