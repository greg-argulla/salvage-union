/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import OBR from "@owlbear-rodeo/sdk";
import "./App.css";

const Text = (props) => {
  const { children } = props;
  return <span className="outline">{children}</span>;
};

const SALVAGER = () => {
  return {
    id: Date.now(),
    details: {
      callsign: "",
      class: "",
      motto: "",
      keepsake: "",
      background: "",
      appearance: "",
      mottoUsed: false,
      keepsakeUsed: false,
      backgroundUsed: false,
      avatar: "",
    },
    stats: {
      HP: 10,
      maxHP: 10,
      AP: 5,
      maxAP: 5,
      TP: 0,
      SP: 0,
      EP: 0,
      HT: 0,
    },
    abilities: [],
    mechs: [],
  };
};

const MECH = () => {
  return {
    id: Date.now(),
    categoryName: "",
    categoryInfo: "",
    edit: true,
    items: [{ name: "", info: "", detail: "", isMech: true }],
    isMech: true,
    stats: {
      structure: 10,
      energy: 10,
      heatCap: 5,
      systemSlots: 5,
      moduleSlots: 0,
      cargoCap: 0,
      techLevel: 0,
      salvageValue: 0,
    },
  };
};

function App() {
  const [isOBRReady, setIsOBRReady] = useState(false);
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [role, setRole] = useState("PLAYER");
  const [cookiesNotEnabled, setCookiesNotEnabled] = useState(false);
  const [player, setPlayer] = useState(null);
  const [timeoutID, setTimeoutID] = useState(null);
  const [tab, setTab] = useState("playerList");
  const [playerList, setPlayerList] = useState([]);

  const createPlayerList = async (metadata) => {
    const metadataGet = metadata["salvage.union.character/metadata"];
    const playerListGet = [];
    const keys = Object.keys(metadataGet);
    keys.forEach((key) => {
      playerListGet.push(metadataGet[key]);
    });
    return playerListGet;
  };

  const updatePlayer = (playerGet) => {
    if (!timeoutID) {
      const myTimeout = setTimeout(() => {
        savePlayer();
      }, 500);
      setTimeoutID(myTimeout);
    } else {
      clearTimeout(timeoutID);
      const myTimeout = setTimeout(() => {
        savePlayer();
      }, 500);
      setTimeoutID(myTimeout);
    }
    setPlayer(playerGet);
  };

  const savePlayer = async () => {
    if (player) {
      const metadataData = await OBR.scene.getMetadata();
      const metadata = metadataData["salvage.union.character/metadata"];
      let metadataChange = { ...metadata };
      metadataChange[player.id] = { ...player, lastEdit: id };

      OBR.scene.setMetadata({
        "salvage.union.character/metadata": metadataChange,
      });
      setTimeoutID(null);
    }
  };

  const removePlayer = async (id) => {
    const metadataData = await OBR.scene.getMetadata();
    const metadata = metadataData["salvage.union.character/metadata"];
    let metadataChange = { ...metadata };

    if (confirm("Are you sure you want to delete the character?") == true) {
      delete metadataChange[id];

      OBR.scene.setMetadata({
        "salvage.union.character/metadata": metadataChange,
      });
    }
  };

  useEffect(() => {
    OBR.onReady(async () => {
      OBR.scene.onReadyChange(async (ready) => {
        if (ready) {
          const metadata = await OBR.scene.getMetadata();

          if (metadata["salvage.union.character/metadata"]) {
            const playerListGet = await createPlayerList(metadata);
            setPlayerList(playerListGet);
          }

          setIsOBRReady(true);
          OBR.action.setBadgeBackgroundColor("orange");
          setName(await OBR.player.getName());
          setId(await OBR.player.getId());

          OBR.player.onChange(async (player) => {
            setName(await OBR.player.getName());
          });

          setRole(await OBR.player.getRole());
        } else {
          setIsOBRReady(false);
        }
      });

      if (await OBR.scene.isReady()) {
        const metadata = await OBR.scene.getMetadata();

        if (metadata["salvage.union.character/metadata"]) {
          const playerListGet = await createPlayerList(metadata);
          setPlayerList(playerListGet);
        }

        setIsOBRReady(true);
        setTimeout(() => {
          var objDiv = document.getElementById("chatbox");
          if (objDiv) {
            objDiv.scrollTop = objDiv.scrollHeight;
          }
        }, 100);

        OBR.action.setBadgeBackgroundColor("orange");
        setName(await OBR.player.getName());
        setId(await OBR.player.getId());

        OBR.player.onChange(async (player) => {
          setName(await OBR.player.getName());
        });

        setRole(await OBR.player.getRole());
      }
    });
  }, []);

  useEffect(() => {
    if (isOBRReady) {
      OBR.scene.onMetadataChange(async (metadata) => {
        const playerListGet = await createPlayerList(metadata);
        setPlayerList(playerListGet);
      });
    }
  }, [isOBRReady]);

  const sendAbility = (ability) => {
    const skillData = {
      skillName: ability.name ? ability.name : "Blank skill",
      info: ability.info,
      detail: ability.detail,
      characterName: player.details.callsign,
      userId: id,
      username: name,
      characterID: player.id,
      id: Date.now(),
    };
    OBR.room.setMetadata({
      "salvage.union.character/sendskill": skillData,
    });
  };

  const addAbility = (index, isMech) => {
    const playerGet = { ...player };
    playerGet.abilities[index].items.push({
      name: "",
      info: "",
      detail: "",
      isMech: isMech,
    }),
      updatePlayer(playerGet);
  };

  const removeAbility = (index, itemIndex) => {
    if (confirm("Are you sure you want to delete the ability?") == true) {
      const playerGet = { ...player };
      playerGet.abilities[index].items.splice(itemIndex, 1);
      updatePlayer(playerGet);
    }
  };

  const parseQuote = (str) => {
    const split = str.split("`");

    return split.map((item, index) => {
      if (index % 2 !== 0) {
        return (
          <span key={"parseTilde" + index} style={{ color: "moccasin" }}>
            {item}
          </span>
        );
      }
      return <span key={"parseTilde" + index}>{item}</span>;
    });
  };

  const parseAsterisk = (str) => {
    const split = str.split("*");

    return split.map((item, index) => {
      if (index % 2 !== 0) {
        return (
          <span key={"parseAsterisk" + index} style={{ color: "red" }}>
            {item}
          </span>
        );
      }
      return <span key={"parseAsterisk" + index}>{parseQuote(item)}</span>;
    });
  };

  const parseDetail = (str) => {
    if (str === undefined) return "";
    const detailSplit = str.split("\n");
    return detailSplit.map((item, index) => {
      if (item === "") return <div key={"parseDetail" + index}>&#8205;</div>;

      return <div key={"parseDetail" + index}>{parseAsterisk(item)}</div>;
    });
  };

  const getImage = (str) => {
    return str.substring(str.indexOf("<") + 1, str.lastIndexOf(">"));
  };

  const ability = (data, index, itemIndex) => {
    return (
      <div key={itemIndex}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Text>Name: </Text>
          <input
            className="input-stat"
            style={{
              width: 120,
              color: "lightgrey",
            }}
            value={data.name}
            placeholder={data.isMech ? "System / Module" : "Item / Ability"}
            onChange={(evt) => {
              const playerGet = { ...player };
              playerGet.abilities[index].items[itemIndex].name =
                evt.target.value;
              updatePlayer(playerGet);
            }}
          />
          <Text>Info: </Text>
          <input
            className="input-stat"
            style={{
              width: 240,
              color: "lightgrey",
            }}
            value={data.info}
            placeholder={
              data.isMech
                ? "EP Cost / Range / Action Type / Tier / Uses"
                : "AP Cost / Range / Action Type / Equipment"
            }
            onChange={(evt) => {
              const playerGet = { ...player };
              playerGet.abilities[index].items[itemIndex].info =
                evt.target.value;
              updatePlayer(playerGet);
            }}
          />
          <button
            className="button"
            style={{ marginRight: 4 }}
            onClick={() => {
              sendAbility(data);
            }}
          >
            Send
          </button>
          <button
            className="button"
            style={{ width: 25, color: "darkred" }}
            onClick={() => {
              removeAbility(index, itemIndex);
            }}
          >
            ✖
          </button>
        </div>
        <textarea
          className="input-stat"
          rows="40"
          cols="88"
          style={{
            textAlign: "left",
            color: "#FFF",
            height: 50,
            marginLeft: 0,
            marginTop: 4,
            width: 460,
            padding: 4,
          }}
          placeholder="Add Description Here"
          onChange={(evt) => {
            const playerGet = { ...player };
            playerGet.abilities[index].items[itemIndex].detail =
              evt.target.value;
            updatePlayer(playerGet);
          }}
          value={data.detail}
        ></textarea>
      </div>
    );
  };

  const categoryInstance = (data, index) => {
    const categorySearched =
      searchAbilities !== "" &&
      data.categoryName.toLowerCase().includes(searchAbilities.toLowerCase());

    let items = [];

    if (categorySearched) {
      items = data.items;
    } else {
      items = data.items.filter((item) => {
        if (searchAbilities !== "") {
          if (item.name.toLowerCase().includes(searchAbilities.toLowerCase())) {
            return true;
          } else return false;
        } else {
          return true;
        }
      });
    }

    if (searchAbilities !== "" && items.length < 1 && searchAbilities) {
      return "";
    }

    return (
      <div
        className="ability-detail"
        style={{ marginTop: 20, backgroundColor: "#333" }}
        key={index}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={() => {
            const playerGet = { ...player };
            playerGet.abilities[index].collapse =
              !playerGet.abilities[index].collapse;
            updatePlayer(playerGet);
          }}
        >
          <span
            className="outline"
            style={{
              fontSize: 16,
              color: "red",
              marginRight: 5,
            }}
          >
            {data.categoryName}
          </span>
          <span className="outline" style={{ fontSize: 11 }}>
            {data.categoryInfo}
          </span>

          <button
            className="button"
            style={{ marginLeft: "auto", marginRight: 8 }}
            onClick={() => {
              const playerGet = { ...player };
              playerGet.abilities[index].edit = true;
              updatePlayer(playerGet);
            }}
          >
            Edit
          </button>

          {data.collapse ? (
            <span className="outline" style={{ fontSize: 12 }}>
              ▼
            </span>
          ) : (
            <span className="outline" style={{ fontSize: 12 }}>
              ▲
            </span>
          )}
        </div>
        {!data.collapse && (
          <>
            <hr
              style={{
                marginBottom: 8,
                borderColor: "#666",
                backgroundColor: "#666",
                color: "#666",
              }}
            ></hr>
            {data.isMech && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 5,
                  }}
                >
                  <span className="outline" style={{ width: 72 }}>
                    Structure Pts:
                  </span>
                  <input
                    className="input-stat"
                    type="number"
                    style={{
                      width: 20,
                      color: "lightgrey",
                    }}
                    value={player.abilities[index].stats.structure}
                    readOnly
                  />
                  <span className="outline" style={{ width: 72 }}>
                    Energy Pts:
                  </span>
                  <input
                    className="input-stat"
                    type="number"
                    style={{
                      width: 20,
                      color: "lightgrey",
                    }}
                    value={player.abilities[index].stats.energy}
                    readOnly
                  />
                  <span className="outline" style={{ width: 72 }}>
                    Heat Cap:
                  </span>
                  <input
                    className="input-stat"
                    type="number"
                    style={{
                      width: 20,
                      color: "lightgrey",
                    }}
                    value={player.abilities[index].stats.heatCap}
                    readOnly
                  />

                  <span className="outline" style={{ width: 72 }}>
                    System Slots:
                  </span>
                  <input
                    className="input-stat"
                    type="number"
                    style={{
                      width: 20,
                      color: "lightgrey",
                    }}
                    value={player.abilities[index].stats.systemSlots}
                    readOnly
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 5,
                  }}
                >
                  <span className="outline" style={{ width: 72 }}>
                    Module Slots:
                  </span>
                  <input
                    className="input-stat"
                    type="number"
                    style={{
                      width: 20,
                      color: "lightgrey",
                    }}
                    value={player.abilities[index].stats.moduleSlots}
                    readOnly
                  />

                  <span className="outline" style={{ width: 72 }}>
                    Cargo Cap:
                  </span>
                  <input
                    className="input-stat"
                    type="number"
                    style={{
                      width: 20,
                      color: "lightgrey",
                    }}
                    value={player.abilities[index].stats.cargoCap}
                    readOnly
                  />

                  <span className="outline" style={{ width: 72 }}>
                    Tech Level:
                  </span>
                  <input
                    className="input-stat"
                    type="number"
                    style={{
                      width: 20,
                      color: "lightgrey",
                    }}
                    value={player.abilities[index].stats.techLevel}
                    readOnly
                  />

                  <span className="outline" style={{ width: 72 }}>
                    Salvage Value:
                  </span>
                  <input
                    className="input-stat"
                    type="number"
                    style={{
                      width: 20,
                      color: "lightgrey",
                    }}
                    value={player.abilities[index].stats.salvageValue}
                    readOnly
                  />
                </div>
              </>
            )}
            {items.map((item, itemIndex) => {
              return abilityInstance(item, index, itemIndex);
            })}
          </>
        )}
      </div>
    );
  };

  const sortCategoryUp = (index) => {
    if (index !== 0) {
      const playerGet = { ...player };
      const skillOne = playerGet.abilities[index];
      const skillTwo = playerGet.abilities[index - 1];
      playerGet.abilities[index] = skillTwo;
      playerGet.abilities[index - 1] = skillOne;
      updatePlayer(playerGet);
    }
  };

  const sortCategoryDown = (index) => {
    if (index < player.abilities.length - 1) {
      const playerGet = { ...player };
      const skillOne = playerGet.abilities[index];
      const skillTwo = playerGet.abilities[index + 1];
      playerGet.abilities[index] = skillTwo;
      playerGet.abilities[index + 1] = skillOne;
      updatePlayer(playerGet);
    }
  };

  const addMech = () => {
    const playerGet = { ...player };
    playerGet.abilities.push(MECH());
    updatePlayer(playerGet);
  };

  const addCategory = () => {
    const playerGet = { ...player };
    playerGet.abilities.push({
      categoryName: "",
      categoryInfo: "",
      edit: true,
      items: [{ name: "", info: "", detail: "" }],
    });
    updatePlayer(playerGet);
  };

  const removeCategory = (index) => {
    if (confirm("Are you sure you want to delete the category?") == true) {
      const playerGet = { ...player };
      playerGet.abilities.splice(index, 1);
      updatePlayer(playerGet);
    }
  };

  const category = (data, index) => {
    const categorySearched =
      searchAbilities !== "" &&
      data.categoryName.toLowerCase().includes(searchAbilities.toLowerCase());

    let items = [];

    if (categorySearched) {
      items = data.items;
    } else {
      items = data.items.filter((item) => {
        if (searchAbilities !== "") {
          if (item.name.toLowerCase().includes(searchAbilities.toLowerCase())) {
            return true;
          } else return false;
        } else {
          return true;
        }
      });
    }

    if (searchAbilities !== "" && items.length < 1 && searchAbilities) {
      return "";
    }

    return (
      <div style={{ marginTop: 20 }} key={index}>
        <hr />
        <div style={{ display: "flex", alignItems: "center" }}>
          <Text>{data.isMech ? "Mech:" : "Category:"}</Text>
          <input
            className="input-stat"
            style={{
              width: 100,
              color: "lightgrey",
            }}
            value={data.categoryName}
            placeholder={data.isMech ? "Mech Name" : "Class / Inventory"}
            onChange={(evt) => {
              const playerGet = { ...player };
              playerGet.abilities[index].categoryName = evt.target.value;
              updatePlayer(playerGet);
            }}
          />
          <Text>{data.isMech ? "Chassis:" : "Info:"} </Text>
          <input
            className="input-stat"
            style={{
              width: 130,
              color: "lightgrey",
            }}
            value={data.categoryInfo}
            placeholder={data.isMech ? "Chassis Name" : "Level / Slots"}
            onChange={(evt) => {
              const playerGet = { ...player };
              playerGet.abilities[index].categoryInfo = evt.target.value;
              updatePlayer(playerGet);
            }}
          />
          <button
            className="button"
            style={{ width: 25, marginRight: 4 }}
            onClick={() => {
              sortCategoryUp(index);
            }}
          >
            ↑
          </button>
          <button
            className="button"
            style={{ width: 25, marginRight: 4 }}
            onClick={() => {
              sortCategoryDown(index);
            }}
          >
            ↓
          </button>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              className="button"
              style={{ fontWeight: "bolder", width: 25, marginRight: 4 }}
              onClick={() => {
                addAbility(index, data.isMech);
              }}
            >
              +
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              className="button"
              style={{ fontWeight: "bolder", width: 50, marginRight: 4 }}
              onClick={() => {
                const playerGet = { ...player };
                playerGet.abilities[index].edit = false;
                updatePlayer(playerGet);
              }}
            >
              Done
            </button>
          </div>
          <button
            className="button"
            style={{ fontWeight: "bolder", width: 25, color: "darkred" }}
            onClick={() => {
              removeCategory(index);
            }}
          >
            ✖
          </button>
        </div>

        {data.isMech && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 5,
              }}
            >
              <span className="outline" style={{ width: 72 }}>
                Structure Pts:
              </span>
              <input
                className="input-stat"
                type="number"
                style={{
                  width: 20,
                  color: "orange",
                }}
                value={player.abilities[index].stats.structure}
                onChange={(evt) => {
                  const playerGet = { ...player };
                  playerGet.abilities[index].stats.structure = evt.target.value;
                  updatePlayer(playerGet);
                }}
              />
              <span className="outline" style={{ width: 72 }}>
                Energy Pts:
              </span>
              <input
                className="input-stat"
                type="number"
                style={{
                  width: 20,
                  color: "orange",
                }}
                value={player.abilities[index].stats.energy}
                onChange={(evt) => {
                  const playerGet = { ...player };
                  playerGet.abilities[index].stats.energy = evt.target.value;
                  updatePlayer(playerGet);
                }}
              />
              <span className="outline" style={{ width: 72 }}>
                Heat Cap:
              </span>
              <input
                className="input-stat"
                type="number"
                style={{
                  width: 20,
                  color: "orange",
                }}
                value={player.abilities[index].stats.heatCap}
                onChange={(evt) => {
                  const playerGet = { ...player };
                  playerGet.abilities[index].stats.heatCap = evt.target.value;
                  updatePlayer(playerGet);
                }}
              />

              <span className="outline" style={{ width: 72 }}>
                System Slots:
              </span>
              <input
                className="input-stat"
                type="number"
                style={{
                  width: 20,
                  color: "orange",
                }}
                value={player.abilities[index].stats.systemSlots}
                onChange={(evt) => {
                  const playerGet = { ...player };
                  playerGet.abilities[index].stats.systemSlots =
                    evt.target.value;
                  updatePlayer(playerGet);
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 5,
              }}
            >
              <span className="outline" style={{ width: 72 }}>
                Module Slots:
              </span>
              <input
                className="input-stat"
                type="number"
                style={{
                  width: 20,
                  color: "orange",
                }}
                value={player.abilities[index].stats.moduleSlots}
                onChange={(evt) => {
                  const playerGet = { ...player };
                  playerGet.abilities[index].stats.moduleSlots =
                    evt.target.value;
                  updatePlayer(playerGet);
                }}
              />

              <span className="outline" style={{ width: 72 }}>
                Cargo Cap:
              </span>
              <input
                className="input-stat"
                type="number"
                style={{
                  width: 20,
                  color: "orange",
                }}
                value={player.abilities[index].stats.cargoCap}
                onChange={(evt) => {
                  const playerGet = { ...player };
                  playerGet.abilities[index].stats.cargoCap = evt.target.value;
                  updatePlayer(playerGet);
                }}
              />

              <span className="outline" style={{ width: 72 }}>
                Tech Level:
              </span>
              <input
                className="input-stat"
                type="number"
                style={{
                  width: 20,
                  color: "orange",
                }}
                value={player.abilities[index].stats.techLevel}
                onChange={(evt) => {
                  const playerGet = { ...player };
                  playerGet.abilities[index].stats.techLevel = evt.target.value;
                  updatePlayer(playerGet);
                }}
              />

              <span className="outline" style={{ width: 72 }}>
                Salvage Value:
              </span>
              <input
                className="input-stat"
                type="number"
                style={{
                  width: 20,
                  color: "orange",
                }}
                value={player.abilities[index].stats.salvageValue}
                onChange={(evt) => {
                  const playerGet = { ...player };
                  playerGet.abilities[index].stats.salvageValue =
                    evt.target.value;
                  updatePlayer(playerGet);
                }}
              />
            </div>
          </>
        )}
        <hr style={{ marginBottom: 10 }} />
        {items.map((item, itemIndex) => {
          return ability(item, index, itemIndex);
        })}
      </div>
    );
  };

  const [searchAbilities, setSearchAbilities] = useState("");

  const [collapseAll, setCollapseAll] = useState(true);

  const renderCategory = () => {
    return (
      <div>
        <div>
          <Text>Search: </Text>
          <input
            className="input-stat"
            style={{
              width: 150,
              color: "lightgrey",
            }}
            value={searchAbilities}
            onChange={(evt) => {
              setSearchAbilities(evt.target.value);
            }}
          />
          {searchAbilities !== "" && (
            <button
              className="button"
              style={{ fontWeight: "bolder", width: 40 }}
              onClick={() => {
                setSearchAbilities("");
              }}
            >
              Clear
            </button>
          )}
          <button
            className="button"
            style={{
              fontWeight: "bolder",
              width: 60,
              float: "right",
              marginTop: 2,
              marginLeft: 4,
            }}
            onClick={() => {
              const playerGet = { ...player };

              playerGet.abilities.forEach((_, index) => {
                playerGet.abilities[index].collapse = collapseAll;
              });

              updatePlayer(playerGet);
              setCollapseAll(!collapseAll);
            }}
          >
            {collapseAll ? "Collapse" : "Uncollapse"}
          </button>
          <button
            className="button"
            style={{
              fontWeight: "bolder",
              width: 60,
              float: "right",
              marginTop: 2,
              marginLeft: 4,
            }}
            onClick={() => addMech()}
          >
            Add Mech
          </button>
          <button
            className="button"
            style={{
              fontWeight: "bolder",
              width: 80,
              float: "right",
              marginTop: 2,
            }}
            onClick={() => addCategory()}
          >
            Add Category
          </button>
        </div>

        {player.abilities.map((item, index) => {
          if (!item.edit) {
            return categoryInstance(item, index);
          } else {
            return category(item, index);
          }
        })}
      </div>
    );
  };

  const abilityInstance = (data, index, itemIndex) => {
    let propsString = JSON.stringify(data);
    const imageURL = getImage(propsString);

    if (imageURL) {
      propsString = propsString.replace("<" + imageURL + ">", "");
    }

    const item = JSON.parse(propsString);
    return (
      <div
        key={"abilityInstance" + itemIndex}
        style={{ marginTop: 10, marginBottom: 10 }}
      >
        <div className="ability-detail">
          <div
            style={{
              fontSize: 13,
              color: "darkorange",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div>{item.name}</div>
              {item.info ? (
                <div
                  style={{ color: "darkgrey", cursor: "copy", fontSize: 10 }}
                >
                  {item.info}
                </div>
              ) : (
                ""
              )}
            </div>
            <div>
              <button
                className="button"
                style={{
                  float: "right",
                  font: 10,
                  padding: 4,
                  marginLeft: 8,
                }}
                onClick={() => {
                  sendAbility(data);
                }}
              >
                Send
              </button>
            </div>
          </div>

          <hr
            style={{
              marginTop: 6,
              marginBottom: 6,
              borderColor: "grey",
              backgroundColor: "grey",
              color: "grey",
            }}
          ></hr>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 3 }}>
              {parseDetail(item.detail ? item.detail.trim() : "")}
            </div>
            {imageURL && (
              <div
                style={{
                  flex: 1,
                  backgroundImage: `url(${imageURL})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  height: 80,
                  overflow: "hidden",
                  marginLeft: "auto",
                  marginRight: "auto",
                  borderRadius: 5,
                }}
              ></div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (cookiesNotEnabled) {
    return (
      <div
        style={{
          background: "#444",
          height: 540,
          width: 550,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            paddingLeft: 25,
            paddingRight: 20,
            paddingTop: 40,
          }}
        >
          <div className="outline" style={{ color: "red", font: 14 }}>
            Error:
          </div>
          <div className="outline" style={{ fontSize: 14 }}>
            You need to enable 3rd Party cookies for this extention to work.
            This is because some chat data is stored in the browser localstorage
            that enables to cache some user data and settings.
          </div>
        </div>
      </div>
    );
  }

  if (!isOBRReady) {
    return (
      <div
        style={{
          height: 540,
          width: 550,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            paddingLeft: 25,
            paddingRight: 20,
            paddingTop: 40,
          }}
        >
          <div className="outline" style={{ color: "red", font: 14 }}>
            No Scene found.
          </div>
          <div className="outline" style={{ fontSize: 14 }}>
            You need to load a scene to enable the chat and dice roller. If a
            scene is already loaded, kindly refresh the page.
          </div>
        </div>
      </div>
    );
  }

  const playerItem = (data, index) => {
    return (
      <div key={index}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 5,
            marginTop: 5,
          }}
        >
          <Text>Pilot: </Text>
          <span
            className="outline"
            style={{
              display: "inline-block",
              fontSize: 12,
              color: "orange",
              width: 120,
              textAlign: "center",
              padding: 4,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {data.details.codename}
          </span>
          <Text>HP:</Text>
          <input
            className="input-stat"
            style={{
              width: 20,
              color: "Red",
            }}
            readOnly={true}
            value={data.stats.HP}
          />
          <Text>AP:</Text>
          <input
            className="input-stat"
            style={{
              width: 20,
              color: "violet",
            }}
            readOnly={true}
            value={data.stats.AP}
          />
          <Text>SP:</Text>
          <input
            className="input-stat"
            style={{
              width: 20,
              color: "lightgrey",
            }}
            readOnly={true}
            value={data.stats.SP}
          />
          <Text>EP:</Text>
          <input
            className="input-stat"
            style={{
              width: 20,
              color: "cyan",
            }}
            readOnly={true}
            value={data.stats.EP}
          />
          <Text>HT:</Text>
          <input
            className="input-stat"
            style={{
              width: 20,
              color: "orange",
            }}
            readOnly={true}
            value={data.stats.HT}
          />
          <button
            className="button"
            style={{
              width: 96,
              padding: 5,
              marginRight: 4,
              marginLeft: "auto",
            }}
            onClick={() => {
              setPlayer(data);
              setTab("player");
            }}
          >
            Open
          </button>
          <button
            className="button"
            style={{
              fontWeight: "bolder",
              width: 25,
              color: "darkred",
            }}
            onClick={() => {
              removePlayer(data.id);
            }}
          >
            ✖
          </button>
        </div>
        <hr />
      </div>
    );
  };

  const addPlayer = async () => {
    const playerGet = SALVAGER();
    const metadataData = await OBR.scene.getMetadata();
    const metadata = metadataData["salvage.union.character/metadata"];
    let metadataChange = { ...metadata };
    metadataChange[playerGet.id] = playerGet;

    OBR.scene.setMetadata({
      "salvage.union.character/metadata": metadataChange,
    });
  };

  const renderPlayerList = () => {
    return (
      <div
        className="scrollable-container"
        style={{
          backgroundColor: "#444",
          padding: 20,
          overflow: "scroll",
          height: 540,
          border: "1px solid #222",
        }}
      >
        <div className="outline" style={{ fontSize: 14, color: "lightgrey" }}>
          Salvage Union
        </div>
        <hr></hr>
        {playerList.map((item, index) => {
          return playerItem(item, index);
        })}
        <button
          className="button"
          style={{ fontWeight: "bolder", width: 80, float: "right" }}
          onClick={() => {
            addPlayer();
          }}
        >
          Add Character
        </button>
      </div>
    );
  };

  const renderInfo = () => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          paddingLeft: 15,
          paddingRight: 15,
          paddingTop: 15,
          alignItems: "center",
        }}
      >
        <span className="outline" style={{ marginRight: 4, fontSize: 11 }}>
          Pilot:
        </span>
        <input
          className="input-stat"
          style={{
            width: 140,
            color: "white",
          }}
          value={player.details.callsign}
          onChange={(evt) => {
            const playerGet = { ...player };
            playerGet.details.callsign = evt.target.value;
            updatePlayer(playerGet);
          }}
        />
        <span className="dice-result">HP:</span>
        <input
          className="input-stat"
          type="number"
          style={{
            width: 20,
            color: "red",
          }}
          value={player.stats.HP}
          onChange={(evt) => {
            const playerGet = { ...player };
            playerGet.stats.HP = evt.target.value;
            updatePlayer(playerGet);
          }}
        />
        <span className="dice-result">AP:</span>
        <input
          className="input-stat"
          type="number"
          style={{
            width: 20,
            color: "violet",
          }}
          value={player.stats.AP}
          onChange={(evt) => {
            const playerGet = { ...player };
            playerGet.stats.AP = evt.target.value;
            updatePlayer(playerGet);
          }}
        />
        <span className="dice-result">SP:</span>
        <input
          className="input-stat"
          type="number"
          style={{
            width: 20,
            color: "lightgrey",
          }}
          value={player.stats.AP}
          onChange={(evt) => {
            const playerGet = { ...player };
            playerGet.stats.AP = evt.target.value;
            updatePlayer(playerGet);
          }}
        />
        <span className="dice-result">EP:</span>
        <input
          className="input-stat"
          type="number"
          style={{
            width: 20,
            color: "cyan",
          }}
          value={player.stats.EP}
          onChange={(evt) => {
            const playerGet = { ...player };
            playerGet.stats.EP = evt.target.value;
            updatePlayer(playerGet);
          }}
        />
        <span className="dice-result">HT:</span>
        <input
          className="input-stat"
          type="number"
          style={{
            width: 20,
            color: "orange",
          }}
          value={player.stats.HT}
          onChange={(evt) => {
            const playerGet = { ...player };
            playerGet.stats.HT = evt.target.value;
            updatePlayer(playerGet);
          }}
        />
        <button
          className="button"
          style={{
            width: 35,
            color: "red",
            marginLeft: "auto",
          }}
          onClick={() => {
            setPlayer(null);
            setTab("playerList");
          }}
        >
          Close
        </button>
      </div>
    );
  };

  const renderDetails = () => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          paddingLeft: 15,
          paddingRight: 15,
          paddingTop: 5,
          alignItems: "center",
        }}
      >
        <span className="outline" style={{ marginRight: 4, fontSize: 11 }}>
          Background:
        </span>
        <input
          className="input-stat"
          style={{
            width: 160,
            color: "white",
          }}
          value={player.details.background}
          onChange={(evt) => {
            const playerGet = { ...player };
            playerGet.details.background = evt.target.value;
            updatePlayer(playerGet);
          }}
        />

        <button
          className="button"
          style={{
            fontSize: 10,
            width: 38,
            marginRight: 8,
            textTransform: "capitalize",
            backgroundColor: player.details.backgroundUsed ? "darkred" : "#222",
            color: player.details.backgroundUsed ? "white" : "#ffd433",
          }}
          onClick={() => {
            const playerGet = { ...player };
            playerGet.details.backgroundUsed = !player.details.backgroundUsed;
            updatePlayer(playerGet);
          }}
        >
          Used
        </button>
        <span className="dice-result">Max HP:</span>
        <input
          className="input-stat"
          type="number"
          style={{
            width: 20,
            color: "red",
            marginLeft: 5,
          }}
          value={player.stats.maxHP}
          onChange={(evt) => {
            const playerGet = { ...player };
            playerGet.stats.maxHP = evt.target.value;
            updatePlayer(playerGet);
          }}
        />
      </div>
    );
  };

  const renderDetails2 = () => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          paddingLeft: 15,
          paddingRight: 15,
          paddingTop: 5,
          alignItems: "center",
        }}
      >
        <span className="outline" style={{ marginRight: 14.5, fontSize: 11 }}>
          Keepsake:
        </span>
        <input
          className="input-stat"
          style={{
            width: 160,
            color: "white",
          }}
          value={player.details.keepsake}
          onChange={(evt) => {
            const playerGet = { ...player };
            playerGet.details.keepsake = evt.target.value;
            updatePlayer(playerGet);
          }}
        />

        <button
          className="button"
          style={{
            fontSize: 10,
            width: 38,
            marginRight: 8,
            textTransform: "capitalize",
            backgroundColor: player.details.keepsakeUsed ? "darkred" : "#222",
            color: player.details.keepsakeUsed ? "white" : "#ffd433",
          }}
          onClick={() => {
            const playerGet = { ...player };
            playerGet.details.keepsakeUsed = !player.details.keepsakeUsed;
            updatePlayer(playerGet);
          }}
        >
          Used
        </button>

        <span className="dice-result">Max AP:</span>
        <input
          className="input-stat"
          type="number"
          style={{
            width: 20,
            color: "cyan",
            marginLeft: 6,
          }}
          value={player.stats.maxAP}
          onChange={(evt) => {
            const playerGet = { ...player };
            playerGet.stats.maxAP = evt.target.value;
            updatePlayer(playerGet);
          }}
        />
      </div>
    );
  };

  const renderDetails3 = () => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          paddingLeft: 15,
          paddingRight: 15,
          paddingTop: 5,
          alignItems: "center",
        }}
      >
        <span className="outline" style={{ marginRight: 33, fontSize: 11 }}>
          Motto:
        </span>
        <input
          className="input-stat"
          style={{
            width: 160,
            color: "white",
          }}
          value={player.details.motto}
          onChange={(evt) => {
            const playerGet = { ...player };
            playerGet.details.motto = evt.target.value;
            updatePlayer(playerGet);
          }}
        />
        <button
          className="button"
          style={{
            fontSize: 10,
            width: 38,
            marginRight: 8,
            textTransform: "capitalize",
            backgroundColor: player.details.mottoUsed ? "darkred" : "#222",
            color: player.details.mottoUsed ? "white" : "#ffd433",
          }}
          onClick={() => {
            const playerGet = { ...player };
            playerGet.details.mottoUsed = !player.details.mottoUsed;
            updatePlayer(playerGet);
          }}
        >
          Used
        </button>
        <span className="dice-result">Training:</span>
        <input
          className="input-stat"
          type="number"
          style={{
            width: 20,
            color: "orange",
          }}
          value={player.stats.TP}
          onChange={(evt) => {
            const playerGet = { ...player };
            playerGet.stats.TP = evt.target.value;
            updatePlayer(playerGet);
          }}
        />
      </div>
    );
  };

  const renderAbilities = () => {
    return (
      <div
        className="scrollable-container"
        style={{
          overflow: "scroll",
          height: 480,
          marginTop: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 100,

              justifyContent: "center",
              alignItems: "center",
              display: "flex",
            }}
          >
            <div
              style={{
                textAlign: "center",
                position: "relative",
                backgroundImage: `url(${player.details.avatar})`,
                minWidth: 100,
                height: 100,
                marginLeft: 20,
                backgroundSize: "cover",
              }}
            >
              {!player.details.avatar && (
                <div
                  className="outline"
                  style={{ width: 100, color: "orange" }}
                >
                  Select a token and press change to add an avatar to your sheet
                </div>
              )}
              <button
                className="button"
                style={{
                  width: 50,
                  padding: 0,
                  height: 15,
                  fontSize: 8,
                  position: "absolute",
                  left: 24,
                  bottom: -3,
                }}
                onClick={async () => {
                  const selected = await OBR.player.getSelection();
                  if (selected && selected[0]) {
                    const items = await OBR.scene.items.getItems([selected[0]]);
                    const playerGet = { ...player };
                    if (items[0].image && items[0].image.url) {
                      playerGet.details.avatar = items[0].image.url;
                      updatePlayer(playerGet);
                    }
                  }
                }}
              >
                Change
              </button>
            </div>
          </div>
          <div>
            {renderDetails()}
            {renderDetails2()}
            {renderDetails3()}
          </div>
        </div>

        <div style={{ marginLeft: 15, marginRight: 15, marginTop: 10 }}>
          <hr></hr>
          {renderCategory()}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        background: "#444",
        height: 540,
        width: 500,
        overflow: "hidden",
      }}
    >
      {tab === "playerList" && renderPlayerList()}
      {tab !== "playerList" && renderInfo()}
      {tab !== "playerList" && renderAbilities()}
    </div>
  );
}

export default App;
