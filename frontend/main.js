// ---------- Welcome splash ----------

const splash = document.getElementById('splash');
const splashSkip = document.getElementById('splashSkip');

function hideSplash() {
    if (splash) {
        splash.classList.add('is-hidden');
    }
}

setTimeout(hideSplash, 2600);

if (splashSkip) {
    splashSkip.addEventListener('click', hideSplash);
}

if (splash) {
    splash.addEventListener('click', (e) => {
        if (e.target === splash) {
            hideSplash();
        }
    });
}


// ---------- Worker / Recruiter toggle ----------

const toggle = document.querySelector('.toggle');
const buttons = document.querySelectorAll('.toggle-btn');
const roleDesc = document.getElementById('roleDesc');
const seeHowBtn = document.getElementById('seeHowBtn');
const root = document.documentElement;

const copy = {
    worker: {
        desc: "Tap the mic on the right and describe your trade and experience—we'll build your profile while you talk.",
        accent: '--marigold',
        accentDeep: '--marigold-deep',
        guide: 'worker-guide',
        micIdle: 'Tap to speak'
    },

    recruiter: {
        desc: "Search by role, years of experience, and location—matching profiles surface instantly.",
        accent: '--teal',
        accentDeep: '--teal-deep',
        guide: 'recruiter-guide',
        micIdle: 'Tap to search by voice'
    }
};

let currentRole = 'worker';

function setRole(role) {
    currentRole = role;

    buttons.forEach((button) => {
        const active = button.dataset.role === role;

        button.classList.toggle('is-active', active);
        button.setAttribute('aria-selected', active);
    });

    if (toggle) {
        toggle.dataset.active = role;
    }

    if (roleDesc) {
        roleDesc.style.opacity = 0;

        setTimeout(() => {
            roleDesc.textContent = copy[role].desc;
            roleDesc.style.opacity = 1;
        }, 150);
    }

    root.style.setProperty(
        '--accent',
        getComputedStyle(root).getPropertyValue(copy[role].accent)
    );

    root.style.setProperty(
        '--accent-deep',
        getComputedStyle(root).getPropertyValue(copy[role].accentDeep)
    );

    // Reflect the role in the mic's idle label (only while not
    // actively listening, so we don't clobber "Listening…" etc.)
    if (micStatus && typeof isListening !== 'undefined' && !isListening) {
        micStatus.textContent = copy[role].micIdle;
    }
}

if (roleDesc) {
    roleDesc.style.transition = 'opacity 0.15s ease';
}

buttons.forEach((button) => {
    button.addEventListener('click', () => {
        setRole(button.dataset.role);
    });
});

if (seeHowBtn) {
    seeHowBtn.addEventListener('click', () => {
        openDrawer(copy[currentRole].guide);
    });
}


// ---------- Hamburger menu -> drawer slides in from the left ----------

const menuBtn = document.getElementById('menuBtn');
const drawerTabs = document.querySelectorAll('.drawer-tab');
const drawer = document.getElementById('drawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const drawerClose = document.getElementById('drawerClose');
const drawerPanels = document.querySelectorAll('.drawer-panel');

let lastPanel = 'talent-pool';

function setActivePanel(panelId) {
    lastPanel = panelId;

    drawerPanels.forEach((panel) => {
        panel.classList.toggle(
            'is-active',
            panel.dataset.panel === panelId
        );
    });

    drawerTabs.forEach((tab) => {
        const active = tab.dataset.panel === panelId;

        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', active);
    });

    // Refresh live profiles every time the Talent Pool tab is shown
    if (panelId === 'talent-pool') {
        loadProfiles();
    }
}

function openDrawer(panelId) {
    if (!drawer || !drawerOverlay) return;

    setActivePanel(panelId || lastPanel);

    drawer.classList.add('is-open');
    drawerOverlay.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');

    if (menuBtn) {
        menuBtn.classList.add('is-open');
        menuBtn.setAttribute('aria-expanded', 'true');
    }
}

function closeDrawer() {
    if (!drawer || !drawerOverlay) return;

    drawer.classList.remove('is-open');
    drawerOverlay.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');

    if (menuBtn) {
        menuBtn.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
    }
}

function toggleDrawer() {
    if (!drawer) return;

    if (drawer.classList.contains('is-open')) {
        closeDrawer();
    } else {
        openDrawer(lastPanel);
    }
}

if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDrawer();
    });
}

// Clicking a horizontal tab inside the open drawer swaps the content
// (drawer stays open, so this feels instant rather than a re-navigation)
drawerTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        setActivePanel(tab.dataset.panel);
    });
});

if (drawerClose) {
    drawerClose.addEventListener('click', closeDrawer);
}

if (drawerOverlay) {
    drawerOverlay.addEventListener('click', closeDrawer);
}

// Close the drawer if the user clicks anywhere outside it
document.addEventListener('click', (e) => {
    if (
        drawer &&
        drawer.classList.contains('is-open') &&
        !drawer.contains(e.target) &&
        e.target !== menuBtn
    ) {
        closeDrawer();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeDrawer();
    }
});


// ---------- Info popover ----------

const infoBtn = document.getElementById('infoBtn');
const infoPopover = document.getElementById('infoPopover');

if (infoBtn && infoPopover) {

    infoBtn.addEventListener('click', (e) => {
        e.stopPropagation();

        infoPopover.classList.toggle('is-open');

        infoPopover.setAttribute(
            'aria-hidden',
            !infoPopover.classList.contains('is-open')
        );
    });

    document.addEventListener('click', (e) => {
        if (
            !infoPopover.contains(e.target) &&
            e.target !== infoBtn
        ) {
            infoPopover.classList.remove('is-open');
            infoPopover.setAttribute('aria-hidden', 'true');
        }
    });
}


// ---------- Voice capture ----------

const micBtn = document.getElementById('micBtn');
const micStatus = document.getElementById('micStatus');
const transcriptText = document.getElementById('transcriptText');
const transcriptInput = document.getElementById('transcriptInput');
const typeToggle = document.getElementById('typeToggle');

const SpeechRecognitionAPI =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;
let isListening = false;


// ---------- Django API ----------

// Local Django backend
const API_BASE_URL = 'https://chakri-backend-oynw.onrender.com';

const profilesList = document.getElementById('profilesList');
const talentSearch = document.getElementById('talentSearch');
const searchRole = document.getElementById('searchRole');
const searchMinExp = document.getElementById('searchMinExp');


// ---------- Load & render the live talent pool ----------

async function loadProfiles({ role = '', minExperience = '' } = {}) {

    if (!profilesList) return;

    profilesList.innerHTML =
        '<p class="profiles-empty">Loading profiles…</p>';

    const params = new URLSearchParams();

    if (role.trim()) {
        params.set('role', role.trim());
    }

    if (minExperience !== '' && minExperience !== null) {
        params.set('min_experience', minExperience);
    }

    const query = params.toString();
    const url = `${API_BASE_URL}/profiles/${query ? `?${query}` : ''}`;

    try {

        const response = await fetch(url);

        console.log(
            '[Chakri] profiles HTTP status:',
            response.status
        );

        if (!response.ok) {
            throw new Error(`Django returned HTTP ${response.status}`);
        }

        const data = await response.json();

        renderProfiles(data, { role, minExperience });

    } catch (error) {

        console.error(
            '[Chakri] Could not load profiles:',
            error
        );

        profilesList.innerHTML =
            '<p class="profiles-empty">Could not load profiles-is the Chakri server running?</p>';
    }
}

function renderProfiles(profiles, activeFilter = {}) {

    if (!profilesList) return;

    const list = Array.isArray(profiles)
        ? profiles
        : (profiles?.results || []);

    if (list.length === 0) {

        const hasFilter =
            (activeFilter.role || '').trim() ||
            activeFilter.minExperience;

        profilesList.innerHTML = hasFilter
            ? '<p class="profiles-empty">No profiles match that search.</p>'
            : '<p class="profiles-empty">No profiles yet-be the first to speak yours in.</p>';

        return;
    }

    profilesList.innerHTML = '';

    list.forEach((profile) => {

        const card = document.createElement('div');
        card.className = 'profile-card';

        const name = escapeHtml(profile.name || 'Unnamed');
        const role = escapeHtml(profile.profession || 'Profession not specified');
        const loc = escapeHtml(profile.location || 'Location not specified');
        const exp = profile.experience_years ?? profile.experience;
        const skills = Array.isArray(profile.skills) ? profile.skills : [];

        const skillsHtml = skills.length
            ? `<div class="profile-card-skills">${skills
                  .map((skill) => `<span class="profile-skill">${escapeHtml(skill)}</span>`)
                  .join('')}</div>`
            : '';

        card.innerHTML = `
            <div class="profile-card-top">
                <span class="profile-card-name">${name}</span>
                ${exp ? `<span class="profile-card-exp">${escapeHtml(String(exp))} yrs</span>` : ''}
            </div>
            <p class="profile-card-role">${role}</p>
            <p class="profile-card-loc">${loc}</p>
            ${skillsHtml}
        `;

        profilesList.appendChild(card);
    });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}


// ---------- Recruiter search form ----------

if (talentSearch) {

    talentSearch.addEventListener('submit', (e) => {
        e.preventDefault();

        loadProfiles({
            role: searchRole?.value || '',
            minExperience: searchMinExp?.value || ''
        });
    });
}


// ---------- Send transcript to Django ----------

async function processTranscript(transcript) {

    console.log('[Chakri] processTranscript() called with:', transcript);

    // Do not send empty text
    if (!transcript || !transcript.trim()) {
        console.log('[Chakri] Empty transcript. Nothing to send.');
        return;
    }

    if (micStatus) {
        micStatus.textContent = 'Sending to Chakri...';
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/extract-profile/`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    transcript: transcript.trim()
                })
            }
        );

        console.log(
            '[Chakri] Django HTTP status:',
            response.status
        );

        if (!response.ok) {
            throw new Error(
                `Django returned HTTP ${response.status}`
            );
        }

        const data = await response.json();

        console.log(
            '[Chakri] Django response:',
            data
        );

        // Update profile card with Django response
        updateProfileCard({
            name: data.name,
            profession: data.profession,
            experience: data.experience_years,
            location: data.location
        });

        if (micStatus) {
            micStatus.textContent = 'Profile extracted successfully';
        }

        // A new profile was just created — refresh the
        // live talent pool if it's currently visible.
        loadProfiles();

    } catch (error) {

        console.error(
            '[Chakri] API connection error:',
            error
        );

        if (micStatus) {
            micStatus.textContent =
                'Could not connect to Django server';
        }
    }
}


// ---------- Update extracted profile card ----------

function updateProfileCard({
    name,
    profession,
    experience,
    location
} = {}) {

    const map = {
        fieldName: name,
        fieldProfession: profession,
        fieldExperience: experience,
        fieldLocation: location
    };

    Object.entries(map).forEach(([id, value]) => {

        const element = document.getElementById(id);

        if (!element) return;

        element.textContent = value || '—';

        element.dataset.empty = value
            ? 'false'
            : 'true';
    });
}


// ---------- Recruiter voice search ----------
// Same mic, different job: parse the spoken query into
// role / experience / location filters, then search the
// talent pool with them. Nothing gets saved to the database.

async function processSearchTranscript(transcript) {

    console.log('[Chakri] processSearchTranscript() called with:', transcript);

    if (!transcript || !transcript.trim()) {
        console.log('[Chakri] Empty transcript. Nothing to search.');
        return;
    }

    if (micStatus) {
        micStatus.textContent = 'Searching Chakri...';
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/parse-search/`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    transcript: transcript.trim()
                })
            }
        );

        console.log(
            '[Chakri] parse-search HTTP status:',
            response.status
        );

        if (!response.ok) {
            throw new Error(`Django returned HTTP ${response.status}`);
        }

        const data = await response.json();

        console.log('[Chakri] Parsed search filters:', data);

        // Reflect what was heard in the search fields,
        // so the recruiter can see and tweak it.
        if (searchRole) {
            searchRole.value = data.role || '';
        }

        if (searchMinExp) {
            searchMinExp.value = data.min_experience || '';
        }

        // Jump straight to the Talent Pool with the results
        openDrawer('talent-pool');

        await loadProfiles({
            role: data.role || '',
            minExperience: data.min_experience || ''
        });

        if (micStatus) {
            micStatus.textContent = 'Showing matching profiles';
        }

    } catch (error) {

        console.error(
            '[Chakri] Search error:',
            error
        );

        if (micStatus) {
            micStatus.textContent = 'Could not search-try again';
        }
    }
}


// ---------- Start Web Speech API ----------

if (SpeechRecognitionAPI) {

    recognition = new SpeechRecognitionAPI();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';


    // ---------- Speech result ----------

    recognition.onresult = (event) => {

        let finalText = '';
        let interimText = '';

        for (
            let i = 0;
            i < event.results.length;
            i++
        ) {

            const chunk =
                event.results[i][0].transcript;

            if (event.results[i].isFinal) {
                finalText += chunk + ' ';
            } else {
                interimText += chunk;
            }
        }

        const combined =
            (finalText + interimText).trim();

        if (transcriptText) {

            transcriptText.textContent =
                combined ||
                'Your words will appear here as you speak…';

            transcriptText.dataset.empty =
                combined ? 'false' : 'true';
        }
    };


    // ---------- Recognition ended ----------
recognition.onend = () => {

    console.log(
        '[Chakri] Speech recognition ended. isListening:',
        isListening
    );

    if (isListening) {

        setTimeout(() => {

            try {
                recognition.start();
            } catch (error) {
                console.log(
                    '[Chakri] Recognition restart:',
                    error
                );
            }

        }, 200);
    }
};



    // ---------- Recognition error ----------

    recognition.onerror = (event) => {

        console.error(
            '[Chakri] Speech recognition error:',
            event.error
        );

        isListening = false;

        if (micBtn) {
            micBtn.classList.remove('is-listening');
            micBtn.setAttribute('aria-pressed', 'false');
        }

        if (micStatus) {
            micStatus.textContent =
                'Something went wrong-tap to try again';
        }
    };


    // ---------- Microphone button ----------
if (micBtn) {

    micBtn.addEventListener('click', async (event) => {

        // Prevent any default browser action
        event.preventDefault();
        event.stopPropagation();

        // ---------- START LISTENING ----------

        if (!isListening) {

            isListening = true;

            micBtn.classList.add('is-listening');
            micBtn.setAttribute('aria-pressed', 'true');

            if (micStatus) {
                micStatus.textContent = 'Listening…';
            }

            try {
                recognition.start();
            } catch (error) {
                console.log(
                    '[Chakri] Recognition already running:',
                    error
                );
            }

            return;
        }


        // ---------- STOP LISTENING ----------

        isListening = false;

        micBtn.classList.remove('is-listening');
        micBtn.setAttribute('aria-pressed', 'false');

        if (micStatus) {
            micStatus.textContent = 'Processing…';
        }

        try {
            recognition.stop();
        } catch (error) {
            console.log(
                '[Chakri] Recognition stop:',
                error
            );
        }

        // Wait for the final speech result
        // before sending it to Django.
        setTimeout(() => {

            const transcript =
                transcriptText?.textContent?.trim() || '';

            console.log(
                '[Chakri] Final transcript:',
                transcript
            );

            if (currentRole === 'recruiter') {
                processSearchTranscript(transcript);
            } else {
                processTranscript(transcript);
            }

        }, 800);

    });

}}


// ---------- Browser does not support voice ----------

else {

    if (micStatus) {
        micStatus.textContent =
            'Voice input isn’t supported here — type instead';
    }

    if (micBtn) {
        micBtn.disabled = true;
        micBtn.style.opacity = '0.4';
        micBtn.style.cursor = 'not-allowed';
    }

    if (transcriptInput) {
        transcriptInput.hidden = false;
    }

    if (transcriptText) {
        transcriptText.hidden = true;
    }

    if (typeToggle) {
        typeToggle.hidden = true;
    }
}


// ---------- Manual typing fallback ----------

if (typeToggle && transcriptInput && transcriptText) {

    typeToggle.addEventListener('click', () => {

        const typing = transcriptInput.hidden;

        transcriptInput.hidden = !typing;
        transcriptText.hidden = typing;

        typeToggle.textContent =
            typing
                ? 'Use voice instead'
                : 'Type instead';

        if (typing) {
            transcriptInput.focus();
        }
    });


    transcriptInput.addEventListener('input', () => {

        // Show typed text immediately
        if (transcriptText) {
            transcriptText.textContent =
                transcriptInput.value ||
                'Your words will appear here…';
        }

        // Send typed text to Django
        // after the user types.
        if (currentRole === 'recruiter') {
            processSearchTranscript(transcriptInput.value);
        } else {
            processTranscript(transcriptInput.value);
        }
    });
}