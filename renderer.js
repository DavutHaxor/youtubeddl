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

    // This function extracts the video id. Supports both long and short URLs.
    function extractVideoId(url) {
        let match = url.match(/[?&]v=([^&]+)/);
        if (match && match[1]) {
            return match[1];
        } else {
            match = url.match(/(?:\/|%3D|v=)([a-zA-Z0-9_-]{11})/);
            return match && match[1];
        }
    }

    // This function checks if a thumbnail format exists.
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

    // Event listener for link input. 
    textbox.addEventListener('input', () => {
        let videoId = extractVideoId(textbox.value);
        if (videoId) { // Here we check if video id is exists
            let thumbnailMaxResUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            let thumbnailSdUrl = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`
            let thumbnailHqUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            thumbnailExists(thumbnailMaxResUrl, function(exists) {
                if (exists) { // Here we check all of the 3 formats for thumbnail. 
                    progress.textContent = ``;
                    thumbnail.src = thumbnailMaxResUrl;
                } else {
                    thumbnailExists(thumbnailSdUrl, function(exists) {
                        if (exists) {
                            progress.textContent = ``;
                            thumbnail.src = thumbnailSdUrl;
                        }
                        else {
                            thumbnailExists(thumbnailHqUrl, function(exists) {
                                if (exists) {
                                    progress.textContent = ``;
                                    thumbnail.src = thumbnailHqUrl;
                                }
                                else {
                                    progress.textContent = `Video does not exist.`;
                                    thumbnail.src = `images/Untitled.png`;
                                }
                            });
                        }
                    });
                }               
            });
        }
        // Default image for thumbnail, just a blank image with our program's background that i created in GIMP.
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
            if (!savePath.includes(";") && !savePath.includes("|")) {
                path.value = savePath;
            }
            else {
                path.value = `Path can't contain semicolons, ambersands and pipes`;
            }
            
        }
    )};

    // When the application first opened, it checks it with 10ms interval since i want the path to come fast. Then it checks every second.
    let checkPathInterval;
    checkPathInterval = setInterval(() => {
        checkPath();
        clearInterval(checkPathInterval);
        checkPathInterval = setInterval(checkPath, 1000);
    }, 10);


    function sanitizeInput(input) {
        // For safety
        return input.replace(/[^a-zA-Z0-9\-_:/]/g, '');
    }


    dlButton.onclick = function() {
        let videoLink = textbox.value;
        let includes = videoLink.includes(";"); // Do not try these at home.
        let includes2 = videoLink.includes("|"); // youtube.com/asdasd ; sudo rm -rf / ... what a funny video id right
        let includes3 = videoLink.includes("&"); // does a url have this? i dont think so.
        videoLink = sanitizeInput(videoLink);
        if (includes || includes2 || includes3) {
            progress.textContent = "You try nasty things!!!";
        }

        if (!includes && !includes2 && !includes3 && mode) {
            progress.textContent = "Checking video quality"
            checkQuality();
        }

        if (!mode) {
            progress.textContent = "Please select a quality.";
        }
    };

    // Gets the path. Actually sends the signal to main. Main gets the path and writes it to the file
    pathOverlay.addEventListener('click', (event, path) => {
        console.log("sending the path:get signal");
        window.electron.sendSignal();
    }) 


    function checkQuality() { // This actually both saves the quality and checks video and audio quality afterwards.
        const { exec } = window.electron.require('child_process');

        const saveQuality = `echo "" > quality.txt | yt-dlp -F ${textbox.value} > quality.txt`;

        exec(saveQuality, (error, stderr, stdout) => {
            if (!error) {
                checkVideoQuality();
            }

            if (error) {
                path.textContent = `There is an error checking the quality.`;
            }
        });
    }

    function checkVideoQuality() { // Executes the checker with the given list of video quality ids.
        switch(mode) {
            case '2160p':
                videoQualityChecker(quality2160p);
            break;

            case '1080p':
                videoQualityChecker(quality1080p);
            break;

            case '720p':
                videoQualityChecker(quality720p);
            break;

            case '360p': 
                videoQualityChecker(quality360p);
            break;

            default: 
                progress.textContent = `Selecting a quality`;
            break;
        }
    }

    function videoQualityChecker(qualityList) {
        let videoQualityId;
        const { exec } = window.electron.require('child_process');
        let i = 0;
        let interval = setInterval(() => { // Checks the list every 0.1 seconds. Good if you dont wanna mess things with a "very fast" for loop
            if (i === qualityList.length) {
                clearInterval(interval);
            }
            videoQualityId = qualityList[i];
            const grepQuality = `grep -P '\\b${videoQualityId}(?![\\d.])\\b' quality.txt`; // grep command to find quality id in text file.
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
        }, 100); 
    }

    function checkAudioQuality() { // Executes the checker with the given list of audio quality ids.
        switch(mode) {
            case '2160p':
                audioQualityChecker(audioQualityMedium);
            break;

            case '1080p':
                audioQualityChecker(audioQualityMedium);
            break;

            case '720p':
                audioQualityChecker(audioQualityLow);
            break;

            case '360p':
                audioQualityChecker(audioQualityLow);
            break;

            default: 
            progress.textContent = `Selecting a quality`;
            break;
        }

    }

    function audioQualityChecker(audioQualityList) {
        const { exec } = window.electron.require('child_process');
        let audioQualityId;
        path.textContent = `Checking audio quality.`;
        let i = 0;
        let interval = setInterval(() => {
            if (i === audioQualityList.length) {
                clearInterval(interval);
            }
            audioQualityId = audioQualityList[i];
            const grepQuality = `grep -P '\\b${audioQualityId}(?![\\d.])\\b' quality.txt`; //same grep command used in videoQualityChecker()
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
        }, 100);
    }

    function road2download() {
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
                vQualityId = vQualityId.trim(); // removes new line character
                console.log(`Video quality id set: ${vQualityId}`);
                road2download2(vQualityId);
            }
        });
    }
    
    function road2download2(vQualityId) {
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
                aQualityId = aQualityId.trim(); // removes new line character
                console.log(`Audio quality id set: ${aQualityId}`);
                download(vQualityId, aQualityId);
            }
        });
    }

    function download(vQualityId, aQualityId) {
        const { exec } = window.electron.require('child_process');
        console.log("Executing download function.")
        // Our download command. yt-dlp bundles the already set video and audio with ${vQualityId}+${aQualityId}
        if(aQualityId) {
            aQualityId = '+' + aQualityId;
        }
        const command = `yt-dlp -f ${vQualityId}${aQualityId} ${textbox.value} -o "${path.value}/%(title)s" > output.txt`;
        // Command to read progress
        let catProgress = `cat output.txt | grep "%"`;
        // Scrolls progress box to bottom
        function scrollToBottom() {
            progress.scrollTop = progress.scrollHeight;
        }
        // Checks the download log every 0.1 seconds
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
        // Executes our download command.
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
            if (!error) {
                progress.textContent = `Saved video successfuly to ${path.value}/`; 
            }
        });
    }

    // Minimize and close
    minimize.addEventListener(('click'), (event, minimize) => {
        window.electron.sendMinimizeSignal();
    });

    close.addEventListener(('click'), (event, minimize) => {
        const { exec } = window.electron.require('child_process'); // Let's clear our junk.
        const clearStuff = `echo "" > output.txt && echo "" > quality.txt && echo "" > audioQualityId.txt && echo "" > output.txt`;
        exec (clearStuff, (error, stderr, stdout) => {});
        window.electron.sendCloseSignal();
    });

    

});
