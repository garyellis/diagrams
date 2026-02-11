/**
 * Figma Plugin Script: Cloudflare Outage Scenario Scaffolder
 * This script creates frames representing the sequence of the outage.
 * You can run this in the Figma Desktop App Console (Cmd+Option+I) 
 * or build it into a full plugin.
 */

const svgData = {
  user: `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="35" r="20" stroke="black" stroke-width="4"/><path d="M20 90C20 70 35 60 50 60C65 60 80 70 80 90" stroke="black" stroke-width="4" stroke-linecap="round"/></svg>`,
  edge_up: `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 60C10 60 10 40 25 40C25 25 45 20 55 30C65 20 85 25 85 45C95 45 95 65 80 65H20" stroke="#F6821F" stroke-width="4" stroke-linejoin="round"/><path d="M40 75L50 85L70 55" stroke="#4CAF50" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  edge_down: `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 60C10 60 10 40 25 40C25 25 45 20 55 30C65 20 85 25 85 45C95 45 95 65 80 65H20" stroke="#F6821F" stroke-width="4" stroke-linejoin="round" opacity="0.5"/><path d="M40 40L60 60M60 40L40 60" stroke="#F44336" stroke-width="4" stroke-linecap="round"/></svg>`,
  api_up: `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="20" width="60" height="50" rx="4" stroke="black" stroke-width="4"/><rect x="30" y="80" width="40" height="4" rx="2" fill="black"/><path d="M40 70L40 80M60 70L60 80" stroke="black" stroke-width="4"/><path d="M40 45H60" stroke="#4CAF50" stroke-width="4" stroke-linecap="round"/></svg>`,
  api_down: `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="20" width="60" height="50" rx="4" stroke="black" stroke-width="4" opacity="0.5"/><rect x="30" y="80" width="40" height="4" rx="2" fill="black" opacity="0.5"/><path d="M40 70L40 80M60 70L60 80" stroke="black" stroke-width="4" opacity="0.5"/><path d="M40 40L60 50M60 40L40 50" stroke="#F44336" stroke-width="4" stroke-linecap="round"/></svg>`,
  admin: `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="30" r="15" stroke="#2196F3" stroke-width="4"/><path d="M30 80L50 45L70 80" stroke="#2196F3" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M40 60H60" stroke="#2196F3" stroke-width="4"/></svg>`,
  origin: `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="25" y="20" width="50" height="70" rx="2" stroke="black" stroke-width="4"/><rect x="35" y="30" width="30" height="5" rx="1" fill="black"/><rect x="35" y="45" width="30" height="5" rx="1" fill="black"/><rect x="35" y="60" width="30" height="5" rx="1" fill="black"/></svg>`
};

async function createDiagram() {
  const frameWidth = 800;
  const frameHeight = 600;
  const spacing = 1000;

  const states = ['Normal', 'Edge Down', 'Full Outage (API Down)'];

  for (let i = 0; i < states.length; i++) {
    const frame = figma.createFrame();
    frame.name = `Scenario: ${states[i]}`;
    frame.resize(frameWidth, frameHeight);
    frame.x = i * spacing;

    // Add Components
    const user = figma.createNodeFromSvg(svgData.user);
    user.x = 50; user.y = 250;
    frame.appendChild(user);

    const edge = figma.createNodeFromSvg(i === 0 ? svgData.edge_up : svgData.edge_down);
    edge.x = 300; edge.y = 250;
    frame.appendChild(edge);

    const origin = figma.createNodeFromSvg(svgData.origin);
    origin.x = 550; origin.y = 250;
    frame.appendChild(origin);

    const api = figma.createNodeFromSvg(i < 2 ? svgData.api_up : svgData.api_down);
    api.x = 300; api.y = 50;
    frame.appendChild(api);

    const admin = figma.createNodeFromSvg(svgData.admin);
    admin.x = 550; admin.y = 50;
    frame.appendChild(admin);

    // Add Labels
    const text = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    text.characters = states[i];
    text.fontSize = 24;
    text.x = 20; text.y = 20;
    frame.appendChild(text);

    // Add arrows/connections logic here if needed
  }

  figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
}

createDiagram().then(() => figma.closePlugin());
