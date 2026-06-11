import type { Template } from "@/types";

export type MarketingCopyPack = {
  industry: string;
  productName: string;
  xiaohongshu: {
    title: string;
    body: string;
    hashtags: string[];
  };
  douyinScript: {
    duration: "15秒";
    hook: string;
    shots: Array<{
      time: string;
      visual: string;
      voiceover: string;
    }>;
  };
  taobaoDetail: {
    title: string;
    sections: string[];
  };
  moments: {
    heartfelt: string;
    promotion: string;
    professional: string;
  };
  hashtags: string[];
};

const industryTone: Record<
  string,
  {
    scene: string;
    benefit: string;
    proof: string;
    emoji: string;
    tags: string[];
  }
> = {
  服装: {
    scene: "通勤、约会和日常出门都能直接穿",
    benefit: "版型利落显精神，上身不挑人",
    proof: "实拍质感清楚，颜色和细节都看得见",
    emoji: "👗",
    tags: ["穿搭", "显瘦穿搭", "通勤穿搭"],
  },
  餐饮: {
    scene: "午餐、聚会和夜宵都适合",
    benefit: "香气足、出品稳定，看图就有食欲",
    proof: "新鲜现做，口味和分量都在线",
    emoji: "🍜",
    tags: ["美食推荐", "本地美食", "探店"],
  },
  房产: {
    scene: "自住、改善和资产配置都可以重点看看",
    benefit: "户型动线顺，采光和空间利用率高",
    proof: "核心信息清楚，卖点一眼能看懂",
    emoji: "🏠",
    tags: ["好房推荐", "买房攻略", "户型解析"],
  },
  培训: {
    scene: "适合想系统提升、少走弯路的人",
    benefit: "内容拆得细，学习路径更清楚",
    proof: "课程重点明确，练习和反馈都能跟上",
    emoji: "📚",
    tags: ["学习提升", "技能成长", "课程推荐"],
  },
  零售: {
    scene: "自用、送礼和门店活动都合适",
    benefit: "实用度高，价格友好，复购压力小",
    proof: "细节展示完整，买前更放心",
    emoji: "🛍️",
    tags: ["好物分享", "门店上新", "实用好物"],
  },
  自媒体: {
    scene: "适合做短视频、图文和直播预热",
    benefit: "开头抓人，信息密度高，转化路径清楚",
    proof: "画面、标题和文案可以成套发布",
    emoji: "📱",
    tags: ["内容运营", "短视频脚本", "账号运营"],
  },
  外贸: {
    scene: "适合独立站、询盘页和海外社媒投放",
    benefit: "卖点表达直接，客户理解成本低",
    proof: "产品规格和使用场景表达清楚",
    emoji: "🌍",
    tags: ["外贸获客", "独立站", "产品展示"],
  },
  宠物: {
    scene: "适合日常护理、陪伴和宠物家庭",
    benefit: "安心好用，照顾宠物也照顾主人体验",
    proof: "细节清楚，使用场景真实",
    emoji: "🐾",
    tags: ["宠物好物", "养宠日常", "宠物用品"],
  },
  美业: {
    scene: "适合约会、通勤和重要场合前管理状态",
    benefit: "提升气色和精致度，效果自然不夸张",
    proof: "前后对比清楚，细节更有说服力",
    emoji: "💄",
    tags: ["美业推荐", "变美日常", "精致生活"],
  },
  婚庆: {
    scene: "适合婚礼、纪念日和仪式感记录",
    benefit: "氛围感足，出片稳定，细节有记忆点",
    proof: "流程和成片效果都能提前预览",
    emoji: "💍",
    tags: ["婚礼灵感", "备婚攻略", "仪式感"],
  },
};

function getTone(industry: string) {
  return (
    industryTone[industry] ?? {
      scene: "适合日常分享、上新和活动推广",
      benefit: "卖点清楚，发布效率高",
      proof: "图片、视频和文案可以成套使用",
      emoji: "✨",
      tags: ["好物分享", "新品上新", "实用推荐"],
    }
  );
}

function uniqueHashtags(items: string[]) {
  return Array.from(
    new Set(
      items
        .map((item) => item.replace(/^#/, "").trim())
        .filter(Boolean)
        .map((item) => `#${item}`),
    ),
  );
}

export function createMarketingCopyPack({
  industry,
  productName,
  sellingPoint,
  tags = [],
}: {
  industry: string;
  productName: string;
  sellingPoint?: string;
  tags?: string[];
}): MarketingCopyPack {
  const tone = getTone(industry);
  const product = productName.trim() || `${industry}新品`;
  const point = sellingPoint?.trim() || tone.benefit;
  const hashtags = uniqueHashtags([
    product,
    industry,
    ...tone.tags,
    ...tags,
    "AI效果工坊",
  ]);

  return {
    industry,
    productName: product,
    xiaohongshu: {
      title: `${tone.emoji} ${product}，这次真的可以闭眼冲`,
      body: [
        `${tone.emoji} 最近被问得最多的就是这款「${product}」。`,
        `它最打动我的地方是：${point}。`,
        `使用场景也很明确，${tone.scene}。`,
        `${tone.proof}，发图文或者短视频都很容易讲清楚。`,
        "想要省时间做内容的，可以直接用这一套图文视频素材发布。",
      ].join("\n\n"),
      hashtags: hashtags.slice(0, 8),
    },
    douyinScript: {
      duration: "15秒",
      hook: `3 秒看懂这款${product}为什么值得点进来。`,
      shots: [
        {
          time: "0-3秒",
          visual: "产品主图/上身效果快速切入，画面给出最强卖点。",
          voiceover: `这款${product}，第一眼就能看到核心优势。`,
        },
        {
          time: "3-8秒",
          visual: "展示细节、材质、使用场景或对比画面。",
          voiceover: point,
        },
        {
          time: "8-12秒",
          visual: "切换到真实场景，叠加价格、规格或服务信息。",
          voiceover: `${tone.scene}，实用度很高。`,
        },
        {
          time: "12-15秒",
          visual: "收尾放大产品和行动按钮。",
          voiceover: "想看细节或同款效果，点进来就能看完整介绍。",
        },
      ],
    },
    taobaoDetail: {
      title: `${product}｜${point}`,
      sections: [
        `核心卖点：${point}。`,
        `适用场景：${tone.scene}。`,
        `品质说明：${tone.proof}。`,
        "购买建议：下单前确认规格、颜色和使用需求，客服可协助推荐。",
        "售后说明：支持按页面规则咨询售后，购物更省心。",
      ],
    },
    moments: {
      heartfelt: `最近上新了「${product}」。做这款的时候最看重的是体验感，${point}。如果你刚好需要，欢迎来看看细节。`,
      promotion: `「${product}」限时上新！${point}。现在咨询可优先发货/锁定活动价，适合想省心入手的朋友。`,
      professional: `${industry}新品「${product}」已上线。核心优势：${point}；适用场景：${tone.scene}；素材、规格和细节都已整理好，欢迎咨询。`,
    },
    hashtags,
  };
}

export function createMarketingCopy({
  template,
  prompt,
  inputText,
}: {
  template: Template;
  prompt?: string;
  inputText?: string;
}) {
  return createMarketingCopyPack({
    industry: template.industry,
    productName: template.title,
    sellingPoint: prompt?.trim() || inputText?.trim() || template.description,
    tags: template.tags,
  });
}
