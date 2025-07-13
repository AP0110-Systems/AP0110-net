// login.js

document.addEventListener('DOMContentLoaded', () => {
    // Inject modal HTML into body
    document.body.insertAdjacentHTML('beforeend', `
        <style>
            #modal {
                position: fixed;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
                display: flex;
                z-index: 999;
                background: #000000 url(static/images/space3.png) no-repeat right top;
                filter: brightness(0.9);
                background-attachment: fixed;
                background-size: cover;
                color: white;
                display: none;
            }
            #modal > div {
                display: flex;
                height: 100%;
                width: 100%;
                /* background-color: rgba(0,0,0,0.5); */
                padding:4em 0;
                pointer-events: auto; /* captures clicks */

                overflow-y: scroll;
                scrollbar-width:none;
                -ms-overflow-style:none;
            }
            #modal > div::-webkit-scrollbar {
                display:none; /* Chrome, Safari, Edge */
            }
            #modal > div:has(#login) {
                padding:0;
            }
                
            #modal > div > div {
                width: 100%;
                max-width: 500px;
                margin: auto;
                display: flex;
                flex-direction: column;
            }
            #modal #login {
                display: flex;
                margin-top: calc(100vh * (1/2.618));
                margin-bottom: 1em;
            }
            #modal #login > div {
                width: 100%;
                height: fit-content;
                display: flex;
                flex-direction: column;
            }
            #modal input,
            #modal textarea {
                height: auto;
                min-height: 40px;
                padding: 12px;
                width: 100%;
                border: none;
                border-radius: 4px;
                font-size: 12pt;
                cursor: pointer;
                background-color: white;
                cursor: text;
                background-color: rgba(255,255,255,0.1);
                color: white;
                -webkit-backdrop-filter: blur(7px);
                backdrop-filter: blur(7px);
            }
            #modal label {
                font-size: smaller;
                margin-bottom: 0.5ch;
            }
            #login label {
                width: fit-content;
                position: relative;
                padding: 4px 4px 0 8px;
                font-family: monospace;
                font-weight: bold;
                font-size: small;
                height: 1em;
                margin: 0;
            }
            #login input {
                outline: none;
                margin: 0;
                height: 40px;
                max-height: 40px;
                flex: 1;
            }
            #modal form {
                display: flex;
                flex-direction: column;
                gap:1ch;
            }
        </style>
        <div id="modal">
            <div>
                
                <div id="login">
                    <svg style="margin:0 auto;" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0" width="40" height="40" viewBox="0, 0, 120, 120">
                        <g>
                        <path d="M70.059,100.049 C47.678,112.813 3.2,131.539 3.189,110.425 L3.157,49.435 C4.044,49.434 4.763,48.715 4.762,47.828 C4.762,46.941 4.042,46.222 3.155,46.223 L3.144,23.749 C4.402,23.748 5.422,22.727 5.421,21.468 C5.284,20.553 4.843,19.665 3.974,19.27 C3.189,18.912 2.785,18.201 2.661,17.373 C2.666,16.549 2.981,16.027 3.648,15.611 L16.893,7.963 L30.139,0.316 C30.833,-0.054 31.442,-0.065 32.159,0.342 C32.814,0.864 33.228,1.569 33.144,2.428 C33.053,3.378 33.601,4.204 34.325,4.781 C35.415,5.411 36.809,5.038 37.439,3.948 L56.896,15.196 C56.452,15.963 56.715,16.946 57.483,17.39 C58.251,17.833 59.233,17.571 59.677,16.803 L112.48,47.326 C130.76,57.892 92.303,87.049 70.059,100.049" fill="#FFFFFF"/>
                        <path d="M37.649,42.827 C39.195,41.934 40.648,41.997 42.121,43.208 L68.156,64.53 C63.752,67.621 59.191,70.471 54.567,73.216 C50.049,75.857 45.332,78.122 40.648,80.444 L35.647,46.946 C35.431,45.009 36.103,43.719 37.649,42.827 z" fill="#ED4D05"/>
                        <path d="M31.94,32.817 L31.94,32.817 C38.597,28.973 44.289,28.73 50.031,33.404 L96.102,70.97 L96.108,70.965 L96.158,71.016 L96.364,71.183 L96.341,71.202 C98.892,73.666 99.804,77.772 97.37,80.653 L97.487,80.855 C91.246,85.991 94.846,83.154 86.575,89.224 L86.453,89.013 C89.155,85.997 87.791,82.032 85.289,79.479 L42.89,44.754 C41.44,43.562 40.01,43.5 38.488,44.379 C36.967,45.257 36.305,46.527 36.518,48.433 L44.702,103.261 C45.469,106.477 48.29,109.827 51.989,109.133 C42.903,113.125 47.142,111.424 39.321,114.356 C35.503,114.961 32.928,111.536 32.034,108.333 L32.039,108.331 L23.213,48.887 C22.131,41.523 25.188,36.715 31.94,32.817 z" fill="#FF4F00"/>
                        <text transform="matrix(0.866, 0.5, -0.5, 0.866, 80.069, 44.594)">
                            <tspan x="-21.674" y="1.886" font-family="Menlo-Bold" font-size="12" fill="#000000">AP0110</tspan>
                        </text>
                        <!-- <path d="M68.044,65.467 C63.64,68.558 59.079,71.407 54.455,74.153 C49.937,76.793 45.22,79.058 40.536,81.381" fill-opacity="0" stroke="#ED4D05" stroke-width="12" stroke-linecap="square"/> -->
                        <path d="M3.946,114.268 C15.426,116.747 29.935,111.402 40.424,107.086 C49.552,103.33 58.398,99.04 67.001,94.213 C79.762,86.528 92.239,78.057 103.017,67.711 C108.148,62.785 113.545,57.184 115.705,50.246 C121.778,57.748 109.319,70.079 104.502,74.703 C94.211,84.582 82.287,92.788 70.048,100.055 C67.591,101.434 65.967,102.364 63.226,103.764 C60.688,105.061 58.153,106.365 55.567,107.562 C43.837,112.989 29.507,119.471 16.249,119.943 C11.661,120.106 5.593,119.353 3.946,114.268 z" fill="#000000" fill-opacity="0.25"/>

                        </g>
                    </svg>

                    <p class="mono float" style="text-align:center;">A P 0 1 1 0</p>
                    <form>
                        <input type="text" id="username" name="username" placeholder="Username" required>
                        
                        <input type="password" id="password" name="password" placeholder="Password" required>
                        
                        <span style="display:flex; gap:1ch;">
                            <button class="gray" type="reset" onclick="closeModal()">Cancel</button>
                            <button id="loginBtn" style="flex:1; color:white;">Log-in</button>
                        </span>
                        <p id="loginError" style="color:red; display:none; margin-top:1em;">Login unsuccessful. Please check your credentials.</p>
                    </form>
                    <!--
                    <span style="flex:1.618"></span>
                    <p class="mono" style="margin:0; text-align:center; opacity:0.75;">or</p>
                    <span style="flex:1"></span>
                    <div>
                        <div style="border: 1px solid var(--color-cyan); border-radius: 4px;">
                            <button class="full blink" style="margin: -1px; width:calc(100% + 2px);" onclick="openModal('get')">Get AP0110</button>
                            <div style="padding:1ch; background-color:rgba(0,0,0,0.25);">
                                <p style="margin:0 auto; color:var(--color-cyan); text-align:center;">One-time purchase</p>
                                <ul style="padding-left: 1.5em; width:fit-content; margin:1em auto;">
                                    <li style="list-style-type:none;">Compliant, high-security <b>AI Cloud computer</b></li>
                                    <li>Offline / air-gap capable</li>
                                    <li>No account or subscription required</li>
                                    <li>Remote access using <b class="mono">AP0110 VPN</b></li>
                                    <li>Enterprise ready, family friendly</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    -->
                </div>


            </div>
        </div>
    `);

    // Modal API
    
    let hasPushedInitialState = false;
    function handleModalState(state) {
        if (state && state.modal) {
            window.openModal(state.modal, state.jobTitle || null, true); // fromPopstate = true
        } else {
            window.closeModal(true);
        }
    }

    window.openModal = function (section, jobTitle, fromPopstate = false) {
        const modal = document.getElementById('modal');
        const login = document.getElementById('login');

        modal.style.display = 'flex';
        login.style.display = 'none';

        if (section === 'login') login.style.display = 'flex';

        // Save original state once
        if (!hasPushedInitialState && !fromPopstate) {
            history.replaceState({ modal: null }, '', window.location.pathname);
            hasPushedInitialState = true;
        }

        // Push modal state
        if (!fromPopstate) {
            const newState = { modal: section };
            if (jobTitle) newState.jobTitle = jobTitle;
            history.pushState(newState, '', `#modal-${section}`);
        }
    };

    window.closeModal = function (fromPopstate = false) {
        const modal = document.getElementById('modal');
        modal.style.display = 'none';

        if (!fromPopstate) {
            history.pushState({ modal: null }, '', window.location.pathname);
        }
        
        // Smoothly scroll to #getAP0110
        const getAP0110Element = document.getElementById('getAP0110');
        if (getAP0110Element) {
            getAP0110Element.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    window.addEventListener('popstate', (event) => {
        handleModalState(event.state);
    });







    // Login logic
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const loginError = document.getElementById('loginError');

    function updateLoginState() {
        const filled = username.value.trim() && password.value.trim();
        loginBtn.classList.toggle('full', filled);
    }

    username.addEventListener('input', updateLoginState);
    password.addEventListener('input', updateLoginState);

    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginError.style.display = 'flex'; // Simulated failure
    });



    // Click outside to close
    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target.id === 'modal') closeModal();
    });
});
