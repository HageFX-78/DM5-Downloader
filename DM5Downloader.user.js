// ==UserScript==
// @name         DM5-Downloader
// @namespace    https://github.com/HageFX-78
// @version      0.1
// @description  DM5 manga chapter downloader, batch download support in future
// @author       HageFX78
// @license      MIT
// @match        *://*.dm5.com/m*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=dm5.com
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.0/FileSaver.min.js
// @grant        none
// ==/UserScript==

(async function () {
    'use strict';
    let addButton = AddDownloadButton();
    let imgList = GetAllImages();

    imgList.then((images) => {
        addButton.style.display = 'block';

        addButton.addEventListener('click', async () => {
            await DownloadAsZip(images);
        });
    });
})();

async function GetAllImages() {
    let imageList = [];

    for (let pg = 1; pg <= DM5_IMAGE_COUNT; pg++) {
        try {
            const params = new URLSearchParams({
                cid: DM5_CID,
                page: pg,
                key: '',
                language: 1,
                gtk: 6,
                _cid: DM5_CID,
                _mid: DM5_MID,
                _dt: DM5_VIEWSIGN_DT,
                _sign: DM5_VIEWSIGN,
            });

            const res = await fetch('/chapterfun.ashx?' + params);
            const js = await res.text();

            eval(js); // This will define `d` in the global scope
            const imgUrl = d[0];
            console.log(d); // Debugging line to check the content of `d`

            const imgBlob = await fetch(imgUrl).then((r) => r.blob());

            imageList.push({
                url: imgUrl,
                blob: imgBlob,
                ext: imgBlob.type.includes('png') ? 'png' : 'jpg',
                page: pg,
            });

            console.log(`DM5D - Page ${pg} loaded`);
        } catch (err) {
            console.error(`DM5D - Failed on page ${pg}:`, err);
        }
    }

    return imageList;
}

function DownloadAsZip(images) {
    const zip = new JSZip();
    const folder = zip.folder(DM5_CTITLE); // New folder

    for (const img of images) {
        const paddedName = String(img.page).padStart(3, '0') + '.' + img.ext;
        folder.file(paddedName, img.blob);
    }

    zip.generateAsync({ type: 'blob' }).then((content) => {
        saveAs(content, `${DM5_CTITLE}.zip`); // Requires FileSaver.js
    });
}

function AddDownloadButton() {
    const downloadButton = document.createElement('button');
    downloadButton.textContent = 'Download Chapter';
    downloadButton.style.position = 'fixed';
    downloadButton.style.bottom = '20px';
    downloadButton.style.fontSize = '24px';
    downloadButton.style.left = '20px';
    downloadButton.style.zIndex = '1000';
    downloadButton.style.padding = '10px 20px';
    downloadButton.style.backgroundColor = '#03c2fc';
    downloadButton.style.color = 'white';
    downloadButton.style.border = 'none';
    downloadButton.style.display = 'none'; // Initially hidde
    downloadButton.style.cursor = 'pointer';

    //on hover
    downloadButton.addEventListener('mouseover', () => {
        downloadButton.style.backgroundColor = '#0299c2';
    });
    downloadButton.addEventListener('mouseout', () => {
        downloadButton.style.backgroundColor = '#03c2fc';
    });

    document.body.appendChild(downloadButton);

    return downloadButton;
}
