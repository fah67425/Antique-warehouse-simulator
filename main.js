let coins = 100;
let solditems = 0;
let shoplevel = 1;
let upgradecost = 150;
let rewardbonus = 0;
let audiocontext;
let musicinterval;
let musicon = false;
let customertime = 0;
let customertimer;
let customerstarttime;

function startmusic() {
    if (musicon) return;

    audiocontext = new AudioContext();
    musicon = true;

    const notes = [261.63, 329.63, 392.00,329.63];

    let index = 0;

    musicinterval = setInterval(() => {
        const oscillator = audiocontext.createOscillator();
        const gain = audiocontext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = notes[index];

        gain.gain.setValueAtTime(0.4, audiocontext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001,audiocontext.currentTime + 0.4);

        oscillator.connect(gain);
        gain.connect(audiocontext.destination);

        oscillator.start();
        oscillator.stop(audiocontext.currentTime + 0.4);
        index = (index + 1) % notes.length;
    }, 500);
}

updateavailableitems();

const itemlevels ={
    "old rolex watch": 1,
    "ancient vase": 1,
    "luxury golden mirror": 1,
    "vintage radio": 1,

    "antique coin": 2,
    "golden trophy": 2,

    "ancient sniper rifle": 3,
    "animal bone axe": 3,
}

const coindisplay = document.getElementById("coins");
const collection = document.getElementById("collection");
const message = document.getElementById("message");

let owneditem = [];

const itemimg = {
    "old rolex watch" : "oldrolex.png",
    "ancient vase" : "vase.png",
    "vintage radio" : "radio.png",
    "antique coin" : "antiquecoin.png",
    "golden trophy" : "goldentrophy.png",
    "ancient sniper rifle" : "sniperrifle.png",
    "animal bone axe" : "animalboneaxe.png",
    "luxury golden mirror" : "mirror.png" 
}

function buyitem(price, itemname) {
    if (coins >= price) {
        coins -= price;
        owneditem.push(itemname);

        updateshop();
        renderchallenges();

        message.textContent = `you bought ${itemname}!`;
        showpopup(`you bought ${itemname}!`);
        playcoinsound();
    } else {
        message.textContent = "not enough coins! keep saving.";
        showpopup("not enough coins! keep saving.")
    }
}

function updateshop() {
    coindisplay.textContent = coins;

    collection.innerHTML = "";

    if (owneditem.length === 0) {
        collection.innerHTML = "<li>No antiques collected yet.</li>";
        return;
    }

    for (const item of owneditem) {
        const listitem = document.createElement("li");

        listitem.innerHTML = `
        <img src="${itemimg[item]}" alt="${item}">
        <span>${item}</span>
        `
        //listitem.textContent = item;
        collection.appendChild(listitem);
    }
}

const challengepool = [
    {
        text : "buy 2 antiques",
        reward : 30,
        check : () => owneditem.length >= 2
    },
    {
        text: "collect 3 different antiques",
        reward: 50,
        check : () => new Set(owneditem).size >= 3
    },
    {
        text: "spend 50 coins",
        reward: 25,
        check: () => coins <= 50
    },
    {
        text: "buy a vintage radio",
        reward: 35,
        check: () => owneditem.includes("vintage radio")
    },
    {
        text: "buy an antique coin",
        reward: 20,
        check: () => owneditem.includes("antique coin")
    }
];

let activechallenges = [];
let claimedchallenges = [];

function newchallenges() {
    activechallenges = [];
    claimedchallenges = [];

    const shuffled = [...challengepool].sort(() => Math.random() - 0.5);

    activechallenges = shuffled.slice(0, 2);

    renderchallenges();
}

function renderchallenges() {
    const container = document.getElementById("challenges");
    container.innerHTML = "";

    activechallenges.forEach((challenge, index) => {
        const card = document.createElement("div");
        card.className = "item";

        const completed = challenge.check();
        const claimed = claimedchallenges.includes(index);

        card.innerHTML = `
        <h3>${challenge.text}</h3>
        <p>reward: ${challenge.reward} coins</p>
        <p>${claimed ? "reward claimed!" : completed ? "completed!" : "in progress"}</p>
        <button ${!completed || claimed ? "disabled" : ""}
            onclick="claimchallenge(${index})">CLAIM REWARD </button>
        `;

        container.appendChild(card);
    });
}

function claimchallenge(index) {
    const challenge = activechallenges[index];

    if (!challenge || claimedchallenges.includes(index)) return;
    if (!challenge.check()) return;

    claimedchallenges.push(index);
    coins += challenge.reward;

    showcoinanimation(challenge.reward);
    updateshop();
    renderchallenges();
    playcashsound();

    message.textContent = `you earned ${challenge.reward} coins!`;
    showpopup(`you earned ${challenge.reward} coins!`);
}

newchallenges();

function showcoinanimation(amount) {
    const container = document.getElementById("coinanimation"); 
    const popup = document.createElement("div");

    popup.className = "coin-popup";
    popup.textContent = `+${amount} coins`;

    container.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 1200);
}

function sellitem() {
    const sellmessage = document.getElementById("sellmessage");

    if (owneditem.length === 0) {
        animatemessage(sellmessage, "you have no antiques to sell");
        return;
    }

    const prices = {
        "old rolex watch": 20,
        "ancient vase": 12,
        "vintage radio": 25,
        "antique coin": 8,
        "golden trophy": 40,
        "ancient sniper rifle": 30,
        "animal bone axe": 15,
        "luxury golden mirror": 35
    };

    const item = owneditem.pop();
    const price = prices[item] ?? 10;

    coins += price;
    solditems++;

    updateshop();
    showcoinanimation(price);
    animatemessage(sellmessage, `sold ${item} for ${price} coins!`);
}

function animatemessage(element, text) {
    element.textContent = text;
    showpopup(text);
}

function showpopup(text) {
    const container = document.getElementById("messagepopup");
    const popup = document.createElement("div");

    popup.className = "messagepopup";
    popup.textContent = text;

    container.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 1800);
}

const customernames = [
    "mr. ronaldo",
    "mr. neymar",
    "mr. kaka",
    "mr. erling",
    "mr. elon musk",
    "mr. raju"
];

const customerorder=[
    {
        item: "old rolex watch",
        reward: 45,
        reaction: "what a sick watch!"
    },
    {
        item: "ancient vase",
        reward: 30,
        reaction: "I really love this vase!"
    },
    {
        item: "luxury golden mirror",
        reward: 70,
        reaction: "phew, almost drained my entire wallet for this!"
    },
    {
        item:"vintage radio",
        reward: 55,
        reaction: "wow, i can't wait to listen my favourite song!"
    },
    {
        item: "antique coin",
        reward: 20,
        reaction: "what an angelic coin!"
    },
    {
        item: "golden trophy",
        reward: 50,
        reaction: "damn, gonna flex ts to my homies!"
    },
    {
        item : "ancient sniper rifle",
        reward: 67,
        reaction: "I can finally hung something on my wall"
    },
    {
        item: "animal bone axe",
        reward: 60,
        reaction: "lets chop some tree with it!"
    }
];

let currentcustomer;
let currentorder;

function newcustomer() {
    clearInterval(customertimer);

    customertime = Math.floor(Math.random() * 16) + 15;

    customerstarttime = Date.now();

    document.getElementById("customertimer").textContent = customertime;

    const availableorders = customerorder.filter(order => {
        return itemlevels[order.item] <= shoplevel;
    });

    const randomname = customernames[Math.floor(Math.random() * customernames.length)];
    const randomorder = availableorders[Math.floor(Math.random() * availableorders.length)];

    currentcustomer = randomname;
    currentorder = randomorder;

    document.getElementById("customername").textContent = currentcustomer;
    document.getElementById("customerrequest").textContent = `I want to buy a ${currentorder.item}!`;
    document.getElementById("customerreward").textContent = Math.floor(
        currentorder.reward * (1 + rewardbonus /100)
    );
    document.getElementById("customermessage").textContent = "waiting for your antique...";
    document.getElementById("completeorderbtn").disabled = false;

    customertimer = setInterval(() => {
        customertime--;

        document.getElementById("customertimer").textContent = customertime;
        if (customertime <= 0) {
            clearInterval(customertimer);

            animatemessage(document.getElementById("customermessage"),"customer left because you were too slow!");

            addreview(1, "too slow. I had to leave.");
            currentorder = null;

            document.getElementById("completeorderbtn").disabled = true;
        }
    }, 1000);
}

function completeorder() {
    if (!currentorder) {
        return;
    }
    const itemindex = owneditem.indexOf(currentorder.item);

    if (itemindex === -1) {
        animatemessage(document.getElementById("customermessage"),
    `you dont own a ${currentorder.item}!`);

    return;
    }
    //const itemname = currentorder.item;
    const reward = Math.floor(currentorder.reward * (1 + rewardbonus / 100));
    const reaction = currentorder.reaction;
    const buyer = currentcustomer;

    owneditem.splice(itemindex, 1);

    coins += reward;

    updateshop();

    showcoinanimation(currentorder.reward);

    animatemessage(
        document.getElementById("customermessage"),`"${reaction}" --${buyer}`

    );
    currentorder = null;
    document.getElementById("completeorderbtn").disabled = true;

    clearInterval(customertimer);
    const timetaken = (Date.now() - customerstarttime) / 1000;
    
    let stars;
    let reviewtext;

    if (timetaken <= 7) {
        stars = 5;
        reviewtext = "very fast service!"
    } else if (timetaken <= 15) {
        stars = 4;
        reviewtext = "Im happy with my purchase."
    } else {
        stars = 3;
        reviewtext = "ts took a while of my time.";
    }

    addreview(stars, reviewtext);
}

newcustomer();

function upgradeshop() {
    if (shoplevel >= 3) {
        animatemessage(
            document.getElementById("upgrademessage"),"no need,your shop is already level 3!"
        );
        return;
    }

    if (coins < upgradecost) {
        animatemessage(document.getElementById("upgrademessage"),"not enough coins! keep saving");
        return;
    }

    coins -= upgradecost;

    shoplevel++;
    rewardbonus += 20;

    updateavailableitems();
    updateshop();
    updateupgradedisplay();
    animatemessage(document.getElementById("upgrademessage"), `shop upgraded to level ${shoplevel}!`);

    showcoinanimation(-upgradecost);

}

function updateupgradedisplay() {
    document.getElementById("shoplevel").textContent = shoplevel;
    document.getElementById("upgradecost").textContent = upgradecost;

    if (shoplevel >= 3) {
        document.getElementById("upgradebutton").disabled = true;

        document.getElementById("upgradecost").textContent = "MAX";
    }
}

function activatecheat() {
    const input = document.getElementById("cheatinput");
    const code = input.value;

    if (code === "iloveterrareviewersomuch") {
        upgradecost = 20;

        updateupgradedisplay();

        animatemessage(
            document.getElementById("cheatmessage"),"cheat activated! upgrade cost is now 20 coins!"
        );
        input.value = "";
    } else {
        animatemessage(document.getElementById("cheatmessage"), "invalid cheat code!");
    }
}

function updateavailableitems() {
    const items = document.querySelectorAll(".item[data-level]");

    items.forEach(item => {
        const requiredlevel = Number(item.dataset.level);

        if (shoplevel >= requiredlevel) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}

startmusic();

function playcoinsound() {
    const oscillator =  audiocontext.createOscillator();
    const gain = audiocontext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(700, audiocontext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200,audiocontext.currentTime + 0.1);

    gain.gain.setValueAtTime(0.6, audiocontext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audiocontext.currentTime + 0.2);

    oscillator.connect(gain);
    gain.connect(audiocontext.destination);

    oscillator.start();
    oscillator.stop(audiocontext.currentTime + 0.2);
}

function playcashsound() {
    const oscillator = audiocontext.createOscillator();
    const gain = audiocontext.createGain();

    oscillator.type = "square"
    oscillator.frequency.setValueAtTime(300, audiocontext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(700, audiocontext.currentTime + 0.15);

    gain.gain.setValueAtTime(0.6, audiocontext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audiocontext.currentTime + 0.3);

    oscillator.connect(gain);
    gain.connect(audiocontext.destination);
    oscillator.start();
    oscillator.stop(audiocontext.currentTime + 0.3);
}

function addreview(stars, text) {
    const reviews = document.getElementById("reviews");
    const review = document.createElement("div");

    review.className = "reviewcard";

    review.innerHTML = `
        <div class="stars">
            ${"★".repeat(stars)}${"☆".repeat(5 - stars)}
            </div>
            
            <p>${text}</p>`;

    reviews.prepend(review);
}