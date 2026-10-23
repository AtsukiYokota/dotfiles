#!/usr/bin/env perl
$latex            = 'platex %O -synctex=1 -halt-on-error %S';
$pdflatex         = 'pdflatex %O -synctex=1 -halt-on-error %S';
$lualatex         = 'lualatex %O -synctex=1 -halt-on-error %S';
$bibtex           = 'pbibtex %O %B';
$biber            = 'biber %O %B';
$dvipdf           = 'dvipdfmx %O -o %D %S';
$makeindex        = 'mendex %O -o %D %S';
$max_repeat       = 5;
$pdf_mode         = 3;
$pvc_view_file_via_temporary = 0;
