import { simpleGit } from "simple-git";

const gitSubmodule = simpleGit("src/lib/constants/NotEnoughUpdates-REPO");

export async function updateNotEnoughUpdatesRepository() {
  try {
    console.log(`[NOT-ENOUGH-UPDATES] Checking for updates...`);

    await gitSubmodule.fetch();
    const diffSummary = await gitSubmodule.diffSummary(["origin/master"]);

    if (diffSummary.files.length > 0) {
      console.log(`[NOT-ENOUGH-UPDATES] Updating submodule...`);
      await gitSubmodule.pull("origin", "master");
      console.log(`[NOT-ENOUGH-UPDATES] Updated submodule!`);
    } else {
      console.log(`[NOT-ENOUGH-UPDATES] No updates found.`);
    }
  } catch (error) {
    console.error("Error updating repository:", error);
  }
}

setInterval(updateNotEnoughUpdatesRepository, 1000 * 60 * 60 * 12);
