const getToml = (target: string) => {
  return `
 name = "temp"
 version = "0.1.0"
 
 target = "${target}"
 
 [dependencies]
 gleam_stdlib = "~> 0.25"
 
 [dev-dependencies]
 gleeunit = "~> 0.7"
 `;
};

const main = async () => {
  const gleamFilePath = Deno.args[0];
  const targetArg = Deno.args[1];

  let target = "javascript";

  if (targetArg) {
    const [flag, value] = targetArg.split("=");
    if ((flag === "--target" && value === "javascript") || value === "erlang") {
      target = value;
    }
  }

  const fileContents = await Deno.readTextFile(gleamFilePath);

  const tempProjectPath = await Deno.makeTempDir();

  const srcDirPath = `${tempProjectPath}/src`;
  await Deno.mkdir(`${tempProjectPath}/src`);

  await Deno.writeTextFile(`${tempProjectPath}/gleam.toml`, getToml(target));
  await Deno.writeTextFile(`${srcDirPath}/temp.gleam`, fileContents);

  const buildProcess = Deno.run({
    cwd: tempProjectPath,
    cmd: ["gleam", "build"],
  });

  const buildStatus = await buildProcess.status();

  if (!buildStatus.success) {
    console.error("Could not build gleam file");
    Deno.exit(1);
  }

  const runProcess = Deno.run({ cwd: tempProjectPath, cmd: ["gleam", "run"] });

  const runStatus = await runProcess.status();

  if (!runStatus.success) {
    console.error("Could not run gleam file");
    Deno.exit(1);
  }
};

main();
