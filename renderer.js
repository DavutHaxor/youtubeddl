document.addEventListener("DOMContentLoaded", function() {
    const thumbnail = document.getElementById("thumbnail");
    const dlButton = document.getElementById("dlButton");
    const textbox = document.getElementById("link");
    const progress = document.getElementById("progress"); 
    progress.disabled = true;
    const p360 = document.getElementById("p360");
    const p720 = document.getElementById("p720");
    const p1080 = document.getElementById("p1080");
    const p2160 = document.getElementById("p2160");
    const path = document.getElementById("path");
    const pathOverlay = document.getElementById("overlay");
    const close = document.getElementById("close");
    const minimize = document.getElementById("minimize");
    const drag = document.getElementById("drag");

    let mode;

    const quality2160p = [
        "628", 
        "315", 
        "625", 
        "313", 
        "401"];

    const quality1080p = [
        "312",
        "617",
        "299",
        "303",
        "270",
        "614",
        "137",
        "248",
    ]

    const quality720p = [
        "311",
        "612",
        "298",
        "302",
        "232",
        "609",
        "22",
        "136",
        "247",
    ]

    const quality360p = [
        "230",
        "605",
        "18",
        "134",
        "243",
    ]

    const audioQualityMedium = [
        "251",
        "140",
    ]

    const audioQualityLow = [
        "250",
        "249",
        "139",
    ]

    p360.addEventListener("click", function() {
        quality = quality360p;
        mode = "360p";
        p360.style = "background-color: rgba(55, 202, 38, 0.6); color: #151515; font-weight: bolder";
        p720.style = "";
        p1080.style = "";
        p2160.style = "";
    })

    p720.addEventListener("click", function() {
        quality = quality720p;
        mode = "720p";
        p360.style = "";
        p720.style = "background-color: rgba(55, 202, 38, 0.6); color: #151515; font-weight: bolder";
        p1080.style = "";
        p2160.style = "";
    })

    p1080.addEventListener("click", function() {
        quality = quality1080p;
        mode = "1080p";
        p360.style = "";
        p720.style = "";
        p1080.style = "background-color: rgba(55, 202, 38, 0.6); color: #151515; font-weight: bolder";
        p2160.style = "";
    })

    p2160.addEventListener("click", function() {
        quality = quality2160p;
        mode = "2160p";
        p360.style = "";
        p720.style = "";
        p1080.style = "";
        p2160.style = "background-color: rgba(55, 202, 38, 0.6); color: #151515; font-weight: bolder";
    })


    function extractVideoId(url) {
        let match = url.match(/[?&]v=([^&]+)/);
        if (match && match[1]) {
            return match[1];
        } else {
            match = url.match(/(?:\/|%3D|v=)([a-zA-Z0-9_-]{11})/);
            return match && match[1];
        }
    }


    function thumbnailExists(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('HEAD', url);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                callback(xhr.status == 200);
            }
        };
        xhr.send(null);
    }


    textbox.addEventListener('input', () => {
        let videoId = extractVideoId(textbox.value);
        if (videoId) {
            let thumbnailMaxResUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            let thumbnailSdUrl = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`
            thumbnailExists(thumbnailMaxResUrl, function(exists) {
                if (exists) {
                    progress.textContent = ``;
                    thumbnail.src = thumbnailMaxResUrl;
                } else {
                    thumbnailExists(thumbnailSdUrl, function(exists) {
                        if (exists) {
                            progress.textContent = ``;
                            thumbnail.src = thumbnailSdUrl;
                        }
                        else {
                            progress.textContent = `Video does not exist.`;
                            thumbnail.src = `images/Untitled.png`;
                        }
                    })
                }
                
            });
        }

        if (!videoId) {
            thumbnail.src = `images/Untitled.png`;
        }

    });

    function checkPath() {
        const { exec } = window.electron.require('child_process');
        const catPath = `cat path.txt`;
        exec(catPath, (error, stdout, stderr) => {
            if (error) {

            }
            if (stderr) {

            }

            let savePath = stdout;
            path.value = savePath;
        }
    )};

    
    let checkPathInterval;
    checkPathInterval = setInterval(() => {
        checkPath();
        clearInterval(checkPathInterval);
        checkPathInterval = setInterval(checkPath, 1000);
    }, 10);


    dlButton.onclick = function() {
        let videoLink = textbox.value;
        let includes = videoLink.includes(";");
        if (includes) {
            progress.textContent = "You try nasty things!!!";
        }
        if (!includes && mode) {
            checkQuality();
        }
        if (!mode) {
            progress.textContent = "Please select a quality.";
        }
    };

    pathOverlay.addEventListener('click', (event, path) => {
        console.log("sending the path:get signal");
        window.electron.sendSignal();
    }) 


    function checkQuality() {
        const { exec } = window.electron.require('child_process');
        let videoQualityId;
        const saveQuality = `echo "" > quality.txt | yt-dlp -F ${textbox.value} > quality.txt`;

        exec(saveQuality, (error, stderr, stdout) => {
            if (!error) {
                switch(mode) {
                    case '2160p':
                        path.textContent = `Checking video quality.`;
                        let i = 0;
                        let interval = setInterval(() => {
                            if (i === quality2160p.length) {
                                clearInterval(interval);
                            }
                            videoQualityId = quality2160p[i];
                            const grepQuality = `grep -P '\\b${videoQualityId}(?![\\d.])\\b' quality.txt`;
                            exec(grepQuality, (error, stdout, stderr) => {
                                if (stdout) {
                                    console.log("Quality id saved successfully");
                                    const saveVideoId = `echo "${videoQualityId}" > qualityId.txt`;
                                    exec(saveVideoId, (error, stderr, stdout) => {
                                    });
                                    clearInterval(interval);
                                    checkAudioQuality();
                                }
                                if (stderr) {
                                    console.error("Error:", stderr);
                                }
                                if (error !== null) {
                                    console.error("Exec error:", error);
                                }
                            });
                            i++;
                        }, 500); 
                    break;

                    case '1080p':
                        path.textContent = `Checking video quality.`;
                        let i1 = 0;
                        let interval1 = setInterval(() => {
                            if (i1 === quality1080p.length) {
                                clearInterval(interval1);
                            }
                            videoQualityId = quality1080p[i1];
                            const grepQuality = `grep -P '\\b${videoQualityId}(?![\\d.])\\b' quality.txt`;
                            exec(grepQuality, (error, stdout, stderr) => {
                                if (stdout) {
                                    console.log("Quality id saved successfully");
                                    const saveVideoId = `echo "${videoQualityId}" > qualityId.txt`;
                                    exec(saveVideoId, (error, stderr, stdout) => {
                                    });
                                    clearInterval(interval1);
                                    checkAudioQuality();
                                }
                                if (stderr) {
                                    console.error("Error:", stderr);
                                }
                                if (error !== null) {
                                    console.error("Exec error:", error);
                                }
                            });
                            i1++;
                        }, 500);
                    break;

                    case '720p':
                    path.textContent = `Checking video quality.`;
                    let i2 = 0;
                    let interval2 = setInterval(() => {
                        if (i2 === quality720p.length) {
                            clearInterval(interval2);
                        }
                        videoQualityId = quality720p[i2];
                        const grepQuality = `grep -P '\\b${videoQualityId}(?![\\d.])\\b' quality.txt`;
                        exec(grepQuality, (error, stdout, stderr) => {
                            if (stdout) {
                                console.log("Quality id saved successfully");
                                const saveVideoId = `echo "${videoQualityId}" > qualityId.txt`;
                                exec(saveVideoId, (error, stderr, stdout) => {
                                });
                                clearInterval(interval2);
                                checkAudioQuality();
                            }
                            if (stderr) {
                                console.error("Error:", stderr);
                            }
                            if (error !== null) {
                                console.error("Exec error:", error);
                            }
                        });
                        i2++;
                    }, 500);
                    break;
                    case '360p': 
                    path.textContent = `Checking video quality.`;
                    let i3 = 0;
                    let interval3 = setInterval(() => {
                        if (i3 === quality360p.length) {
                            clearInterval(interval3);
                        }
                        videoQualityId = quality360p[i3];
                        const grepQuality = `grep -P '\\b${videoQualityId}(?![\\d.])\\b' quality.txt`;
                        exec(grepQuality, (error, stdout, stderr) => {
                            if (stdout) {
                                console.log("Quality id saved successfully");
                                const saveVideoId = `echo "${videoQualityId}" > qualityId.txt`;
                                exec(saveVideoId, (error, stderr, stdout) => {
                                });
                                clearInterval(interval3);
                                checkAudioQuality();
                            }
                            if (stderr) {
                                console.error("Error:", stderr);
                            }
                            if (error !== null) {
                                console.error("Exec error:", error);
                            }
                        });
                        i3++;
                    }, 500);
                    break;
                    default: 
                        progress.textContent = `Selecting a quality`;
                    break;
                }
            }

            if (error) {
                path.textContent = `There is an error checking the quality.`;
            }
        });
    }

    function checkAudioQuality() {
        const { exec } = window.electron.require('child_process');
        let audioQualityId;

        switch(mode) {
            case '1080p':
                path.textContent = `Checking audio quality.`;
                let i = 0;
                let interval = setInterval(() => {
                    if (i === audioQualityMedium.length) {
                        clearInterval(interval);
                    }
                    audioQualityId = audioQualityMedium[i];
                    const grepQuality = `grep -P '\\b${audioQualityId}(?![\\d.])\\b' quality.txt`;
                    exec(grepQuality, (error, stdout, stderr) => {
                        if (stdout) {
                            console.log("Quality id saved successfully");
                            const saveAudioId = `echo "${audioQualityId}" > audioQualityId.txt`;
                            exec(saveAudioId, (error, stderr, stdout) => {
                            });
                            clearInterval(interval);
                            road2download();
                        }
                        if (stderr) {
                            console.error("Error:", stderr);
                        }
                        if (error !== null) {
                            console.error("Exec error:", error);
                        }
                    });
                    i++;
                }, 500); 
            break;

            case '720p':
                path.textContent = `Checking audio quality.`;
                let i1 = 0;
                let interval1 = setInterval(() => {
                    if (i1 === audioQualityLow.length) {
                        clearInterval(interval);
                    }
                    audioQualityId = audioQualityLow[i1];
                    const grepQuality = `grep -P '\\b${audioQualityId}(?![\\d.])\\b' quality.txt`;
                    exec(grepQuality, (error, stdout, stderr) => {
                        if (stdout) {
                            console.log("Quality id saved successfully");
                            const saveAudioId = `echo "${audioQualityId}" > audioQualityId.txt`;
                            exec(saveAudioId, (error, stderr, stdout) => {
                            });
                            clearInterval(interval1);
                            road2download();
                        }
                        if (stderr) {
                            console.error("Error:", stderr);
                        }
                        if (error !== null) {
                            console.error("Exec error:", error);
                        }
                    });
                    i1++;
                }, 500); 
            break;

            default: 
            progress.textContent = `Selecting a quality`;
            break;
        }

    }

    function road2download() {
        path.textContent = `Reading video quality.`;
        const { exec } = window.electron.require('child_process');
        const catQualityId = `cat qualityId.txt`;
        let vQualityId;
        exec(catQualityId, (error, stderr, stdout) => {
            if (error) {
                //console.log(`Error exists and checking quality id`);
                //console.log(error);
            }
            if (stdout) {
                //console.log("Stdout exists and checking quality id.");
                //console.log(stdout);
            }
            if (stderr) {
                vQualityId = stderr;
                vQualityId = vQualityId.trim();
                console.log(vQualityId);
                road2download2(vQualityId);
            }
        });
    }
    
    function road2download2(vQualityId) {
        path.textContent = `Reading audio quality.`;
        const { exec } = window.electron.require('child_process');
        const catQualityId = `cat audioQualityId.txt`;
        let aQualityId;
        exec(catQualityId, (error, stderr, stdout) => {
            if (error) {
                //console.log(`Error exists and checking quality id`);
                //console.log(error);
                download(vQualityId, null)
            }
            if (stdout) {
                //console.log("Stdout exists and checking quality id.");
                //console.log(stdout);
            }
            if (stderr) {
                aQualityId = stderr;
                aQualityId = aQualityId.trim();
                console.log(aQualityId);
                download(vQualityId, aQualityId);
            }
        });
    }

    function download(vQualityId, aQualityId) {
        const { exec } = window.electron.require('child_process');
        console.log("Executing download function.")

        if (aQualityId) {
            const command = `yt-dlp -f ${vQualityId}+${aQualityId} ${textbox.value} -o "${path.value}/%(title)s" > output.txt`;
        }
        else {
            const command = `yt-dlp -f ${vQualityId} ${textbox.value} -o "${path.value}/%(title)s" > output.txt`;
        }

        let catProgress = `cat output.txt | grep "%"`;

        function scrollToBottom() {
            progress.scrollTop = progress.scrollHeight;
        }

        let logInterval;
        logInterval = setInterval(() => {
            exec(catProgress, (error, stdout, stderr) => {
                if (error) {

                }
                if (stderr) {
    
                }
                if (stdout) {
                    progress.textContent = String(stdout);
                }
                scrollToBottom();
            });
        }, 100);

        let downloadInterval;
        downloadInterval = setInterval(() => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.log("Error executing download command");
                    console.log(`Error here: ${error}`);
                }
                if (stderr) {
                    console.log("StdErr executing download command");
                    console.log(`StdErr here: ${stderr}`);
                }
                clearInterval(logInterval);
                clearInterval(downloadInterval);
                if (!error) {
                    progress.textContent = `Saved video successfuly to ${path.value}/`; 
                }
            });
        }, 5000);
    }


    minimize.addEventListener(('click'), (event, minimize) => {
        window.electron.sendMinimizeSignal();
    });

    close.addEventListener(('click'), (event, minimize) => {
        window.electron.sendCloseSignal();
    });

    

});
