const toggle = document.querySelector('#toggle');
toggle.addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id === undefined) throw new Error('No active tab');
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['eyes.js'] });
    window.close();
  } catch {
    document.querySelector('p').textContent = 'Could not add eyes here. Try an ordinary webpage.';
  }
});
