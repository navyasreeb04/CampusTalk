import PlacementPost from "../models/PlacementPost.js";
import SkillPost from "../models/SkillPost.js";

const buildSkillAggregationPipeline = (fieldName) => [
  {
    $project: {
      normalizedSkill: {
        $trim: {
          input: {
            $toLower: `$${fieldName}`,
          },
        },
      },
    },
  },
  {
    $match: {
      normalizedSkill: { $ne: "" },
    },
  },
  {
    $group: {
      _id: "$normalizedSkill",
      count: { $sum: 1 },
    },
  },
  {
    $sort: {
      count: -1,
      _id: 1,
    },
  },
  {
    $limit: 8,
  },
];

const normalizeSkillAnalytics = (items) =>
  items.map((item) => ({
    skill: item._id,
    count: item.count,
  }));

const getSkillDemandData = async () => {
  const skillDemand = await SkillPost.aggregate(buildSkillAggregationPipeline("skillWanted"));
  return normalizeSkillAnalytics(skillDemand);
};

const getSkillOfferedData = async () => {
  const skillOffered = await SkillPost.aggregate(buildSkillAggregationPipeline("skillOffered"));
  return normalizeSkillAnalytics(skillOffered);
};

const getPlacementBreakdown = async () => {
  const placementCounts = await PlacementPost.aggregate([
    {
      $project: {
        placementType: {
          $cond: [
            {
              $regexMatch: {
                input: {
                  $toLower: "$role",
                },
                regex: "intern",
              },
            },
            "internship",
            "fulltime",
          ],
        },
      },
    },
    {
      $group: {
        _id: "$placementType",
        count: { $sum: 1 },
      },
    },
  ]);

  return placementCounts.reduce(
    (result, item) => ({
      ...result,
      [item._id]: item.count,
    }),
    {
      internship: 0,
      fulltime: 0,
    }
  );
};

export const getTopSkillsRequired = async (req, res, next) => {
  try {
    res.json(await getSkillDemandData());
  } catch (error) {
    next(error);
  }
};

export const getTopSkillsOffered = async (req, res, next) => {
  try {
    res.json(await getSkillOfferedData());
  } catch (error) {
    next(error);
  }
};

export const getPlacementStats = async (req, res, next) => {
  try {
    res.json(await getPlacementBreakdown());
  } catch (error) {
    next(error);
  }
};

export const getDashboardData = async (req, res, next) => {
  try {
    const [skillDemand, skillOffered, placements] = await Promise.all([
      getSkillDemandData(),
      getSkillOfferedData(),
      getPlacementBreakdown(),
    ]);

    res.json({
      skillDemand,
      skillOffered,
      placements,
    });
  } catch (error) {
    next(error);
  }
};
