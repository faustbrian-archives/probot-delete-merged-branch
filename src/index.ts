import nm from "nanomatch";
import { Application, Context } from "probot";
import getConfig from "probot-config";

export = (robot: Application) => {
	robot.on("pull_request.closed", async (context: Context) => {
		const config = await getConfig(context, "botamic.yml", {
			exclude: [],
			include: [],
		});
		const headRepoId: string = context.payload.pull_request.head.repo.id;
		const baseRepoId: string = context.payload.pull_request.base.repo.id;

		const owner: string = context.payload.repository.owner.login;
		const repo: string = context.payload.repository.name;
		const branchName: string = context.payload.pull_request.head.ref;
		const ref: string = `heads/${branchName}`;

		if (headRepoId !== baseRepoId) {
			context.log.info(`Closing PR from fork. Keeping ${context.payload.pull_request.head.label}.`);
			return;
		}

		if (Array.isArray(config.exclude)) {
			for (const name of config.exclude) {
				if (nm.isMatch(branchName, name)) {
					context.log.info(
						`Branch ${branchName} excluded. Keeping ${context.payload.pull_request.head.label}.`,
					);
					return;
				}
			}
		}

		if (Array.isArray(config.include)) {
			for (const name of config.include) {
				if (!nm.isMatch(branchName, name)) {
					context.log.info(
						`Branch ${branchName} not included. Keeping ${context.payload.pull_request.head.label}.`,
					);
					return;
				}
			}
		}

		if (!context.payload.pull_request.merged) {
			context.log.info(`PR was closed but not merged. Keeping ${owner}/${repo}/${ref}.`);
			return;
		}

		try {
			await context.github.git.deleteRef({
				owner,
				ref,
				repo,
			});

			context.log.info(`Successfully deleted ${owner}/${repo}/${ref}`);
		} catch (error) {
			context.log.warn(error, `Failed to delete ${owner}/${repo}/${ref}`);
		}
	});
};
