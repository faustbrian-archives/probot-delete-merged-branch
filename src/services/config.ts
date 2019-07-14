import { getConfig } from "@botamic/toolkit";
import Joi from "@hapi/joi";
import { Context } from "probot";

export const loadConfig = async (context: Context): Promise<Record<string, any>> =>
	(await getConfig(
		context,
		"botamic.yml",
		Joi.object({
			deleteMergedBranch: Joi.object({
				exclude: Joi.array()
					.items(Joi.string())
					.default([]),
				include: Joi.array()
					.items(Joi.string())
					.default([]),
			}).default(),
		})
			.unknown(true)
			.default(),
	)).deleteMergedBranch;
