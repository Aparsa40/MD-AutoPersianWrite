import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

function run(command, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      env,
      shell: false,
    });

    child.on("error", reject);

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
  });
}

try {
  console.log("Building Vite app for Electron...");

  await run(npmCommand, ["run", "build"], {
    ...process.env,
    ELECTRON_BUILD: "1",
  });

  console.log("Vite build completed.");
  console.log("Building Windows installer...");

  await run(npxCommand, ["electron-builder", "--win"]);

  console.log("Windows installer build completed.");
} catch (error) {
  console.error("\nElectron build failed:");
  console.error(error);
  process.exit(1);
}