import * as React from 'react';
import {LocalStorageService} from '../services/localStorage-service';
import {isAppTypeExtension} from '../helpers/app-types-helper';
import {getLocalStorageEnums} from '../enums/local-storage.enum';
import {getKeyCodes} from '../enums/key-codes.enum';
import Switch from 'antd/lib/switch'
import {getBrowser} from "../helpers/browser-helper";
import {HtmlStyleHelper} from "../helpers/html-style-helper";
import DefaultPomodoroBreakProject from "./default-pomodoro-break-project.component";

const localStorageService = new LocalStorageService();
const htmlStyleHelper = new HtmlStyleHelper();

class Pomodoro extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            enabled: false,
            timerInterval: '', // null,
            shortBreak: '', // null,
            longBreak: '', // null,
            breakCounter: 0,
            isSoundNotification: false,
            isAutomaticStartStop: false,
            isLongBreakEnabled: false,
            isDefaultProjectEnabled: false,
            defaultProjectForUserOnWorkspace: ""
        };

        this.resizeHeight = this.resizeHeight.bind(this);
    }

    componentDidMount() {
        this.isPomodoroOn();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.isDefaultProjectEnabled !== prevState.isDefaultProjectEnabled) {
            if (this.state.enabled) {
                this.resizeHeight();
            }
        }
    }

    resizeHeight(scrollToBottom) {
        setTimeout(() => {
            const pomodoroElem = document.getElementById('pomodoro');
            if (this.state.enabled) {
                pomodoroElem.style.maxHeight = pomodoroElem.scrollHeight + 'px';
            } else {
                //pomodoroElem.style.maxHeight = '0';
            }

            if (scrollToBottom) {
                this.props.scrollIntoView();
            }
        }, 250);
    }

    get pomodoroStorage() {
        const userId = localStorageService.get('userId');
        const strPomodoro = localStorageService.get('pomodoro');
        const pomodoroStorage = strPomodoro ? JSON.parse(strPomodoro) : [];
        return { 
            pomodoroForUser: pomodoroStorage.find(pomodoro => pomodoro.userId === userId),
            pomodoroStorage
        }
    }

    store(pomodoroStorage) {
        localStorageService
            .set('pomodoro', JSON.stringify(pomodoroStorage), getLocalStorageEnums().PERMANENT_PREFIX);
    }

    isPomodoroOn() {
        const { pomodoroForUser }  = this.pomodoroStorage;
        if (!pomodoroForUser)
            return;

        const { enabled,
                timerInterval,
                shortBreak, 
                longBreak, 
                isLongBreakEnabled, 
                breakCounter,
                isSoundNotification, 
                isAutomaticStartStop, 
                isDefaultProjectEnabled } = pomodoroForUser;

        this.setState({
            enabled,
            timerInterval,
            shortBreak,
            longBreak,
            isLongBreakEnabled,
            breakCounter,
            isSoundNotification,
            isAutomaticStartStop,
            isDefaultProjectEnabled
        }, () => {
            if (this.state.enabled) {
                setTimeout(() => {
                    const pomodoroElem = document.getElementById('pomodoro');
                    if (this.state.enabled) {
                        pomodoroElem.style.maxHeight = pomodoroElem.scrollHeight + 'px';
                    } else {
                        pomodoroElem.style.maxHeight = '0';
                    }
                }, 150);
            }
            const elementsIds = ['longBreak', 'breakCounter'];
            htmlStyleHelper.enableDisableElements(pomodoroForUser.isLongBreakEnabled, elementsIds);
        });
    }

    togglePomodoro() {
        let { pomodoroForUser, pomodoroStorage }  = this.pomodoroStorage;
        let isEnabled;
        
        const pomodoroElem = document.getElementById('pomodoro');
        const elementsIds = ['longBreak', 'breakCounter'];
        const userId = localStorageService.get('userId');

        if (!pomodoroForUser) {
            const obj = {
                userId,
                enabled: true,
                timerInterval: 5,
                shortBreak: 5,
                longBreak: 15,
                isLongBreakEnabled: false,
                breakCounter: 3,
                isSoundNotification: false,
                isAutomaticStartStop: false,
                isDefaultProjectEnabled: false
            }

            pomodoroStorage = [obj];

            const { enabled, timerInterval, shortBreak, 
                    longBreak, isLongBreakEnabled,
                    breakCounter, isSoundNotification, isAutomaticStartStop, 
                    isDefaultProjectEnabled } = obj;

            this.setState({
                enabled,
                timerInterval,
                shortBreak,
                longBreak,
                isLongBreakEnabled,
                breakCounter,
                isSoundNotification,
                isAutomaticStartStop,
                isDefaultProjectEnabled
            }, () => {
                htmlStyleHelper.enableDisableElements(false, elementsIds);
                pomodoroElem.style.maxHeight = pomodoroElem.scrollHeight + 'px'
            });

            isEnabled = true;
        } 
        else {
            if (this.state.enabled) {
                pomodoroForUser.enabled = false;
                this.setState({
                    enabled: false
                }, () => pomodoroElem.style.maxHeight = '0');
                isEnabled = false;
            }
            else {
                pomodoroForUser.enabled = true;
                this.setState({
                    enabled: true
                }, () => pomodoroElem.style.maxHeight = pomodoroElem.scrollHeight + 'px');
                isEnabled = true;
            }
        }
        this.props.changeSaved();
        this.store(pomodoroStorage)

        if (isAppTypeExtension()) {
            if (isEnabled) {
                getBrowser().extension.getBackgroundPage().addPomodoroTimer();
            } else {
                getBrowser().extension.getBackgroundPage().restartPomodoro();
            }
        }
    }

    sendPomodoroRequest() {
        if (isAppTypeExtension()) {
            getBrowser().runtime.sendMessage({
                eventName: "pomodoroTimer"
            });
        }
    }

    changePomodoroProperty(event) {
        let value = parseInt(event.target.value);
        if (value === 0) {
            value = 1;
        }
        const { pomodoroForUser, pomodoroStorage } = this.pomodoroStorage;
        const { id } = event.target;
        if (pomodoroForUser) {
            pomodoroForUser[id] = value ? value : pomodoroForUser[id];
            const obj = {
                [id]: pomodoroForUser[id]
            };
            this.setState(obj);
        }
        this.store(pomodoroStorage);
        this.props.changeSaved();
        if (isAppTypeExtension()) {
            getBrowser().extension.getBackgroundPage().addPomodoroTimer();
        }
    }

    changePomodoroPropertyOnEnter(event) {
        const { enter,  minus } = getKeyCodes();
        if (minus.includes(event.keyCode)) {
            if (event.preventDefault) 
                event.preventDefault();
            return false;
        }
        else if (enter.includes(event.keyCode)) {
            this.changePomodoroProperty(event);
        }
    }

    changePomodoroPropertyState(event) {
        const { id, value } = event.target;
        this.setState({
            [id]: value 
        });
    }

    changeIsSoundNotification(event) {
        const { pomodoroForUser, pomodoroStorage } = this.pomodoroStorage;
        pomodoroForUser.isSoundNotification = event;
        this.store(pomodoroStorage);
        this.props.changeSaved();
        this.setState({
            isSoundNotification: event
        });
    }

    changeIsAutomaticStartStop(event) {
        const { pomodoroForUser, pomodoroStorage } = this.pomodoroStorage;
        pomodoroForUser.isAutomaticStartStop = event;
        this.store(pomodoroStorage);
        this.props.changeSaved();
        this.setState({
            isAutomaticStartStop: event
        });
    }

    changeIsDefaultProjectEnabled(event) {
        const { pomodoroForUser, pomodoroStorage } = this.pomodoroStorage;
        pomodoroForUser.isDefaultProjectEnabled = event;
        this.store(pomodoroStorage);
        this.props.changeSaved();
        this.setState({
            isDefaultProjectEnabled: event
        });
    }    

    toggleLongBreakEnabled(event) {
        const { pomodoroForUser, pomodoroStorage } = this.pomodoroStorage;
        pomodoroForUser.isLongBreakEnabled = event;
        this.store(pomodoroStorage);
        this.props.changeSaved();
        this.setState({
            isLongBreakEnabled: event
        }, () => {
            const elementsIds = ['longBreak', 'breakCounter'];
            htmlStyleHelper.enableDisableElements(event, elementsIds);
        });
    }

    render() {
        const {forceProjects, forceTasks} = this.props.workspaceSettings;
        const name = `Default break project ${forceTasks?' and task':''}`;
        return(
            <div>
                <div className={isAppTypeExtension() ? "pomodoro" : "disabled"}
                     onClick={this.togglePomodoro.bind(this)}>
                        <div className={this.state.enabled ?
                            "pomodoro__checkbox checked" : "pomodoro__checkbox"}>
                            <img src="./assets/images/checked.png"
                                 className={this.state.enabled ?
                                     "pomodoro__checkbox--img" :
                                     "pomodoro__checkbox--img_hidden"}/>
                        </div>
                    <span className="pomodoro__title">Enable pomodoro timer</span>
                </div>
                <div id="pomodoro"
                     className="pomodoro__content expandContainer">
                    <div>
                        <div className="pomodoro__box__content">
                            <p>Timer interval</p>
                            <div className="pomodoro__box__content--right_side">
                                <input id="timerInterval"
                                       value={this.state.timerInterval}
                                       onBlur={this.changePomodoroProperty.bind(this)}
                                       onKeyDown={this.changePomodoroPropertyOnEnter.bind(this)}
                                       onChange={this.changePomodoroPropertyState.bind(this)}/>
                                <p>minutes</p>
                            </div>
                        </div>
                        <div className="pomodoro__box__content">
                            <p>Short break</p>
                            <div className="pomodoro__box__content--right_side">
                                <input id="shortBreak"
                                       value={this.state.shortBreak}
                                       onBlur={this.changePomodoroProperty.bind(this)}
                                       onKeyDown={this.changePomodoroPropertyOnEnter.bind(this)}
                                       onChange={this.changePomodoroPropertyState.bind(this)}/>
                                <p>minutes</p>
                            </div>
                        </div>
                        <div className="pomodoro__border"></div>
                        <div className="pomodoro__box__content">
                            <Switch className="pomodoro__switch"
                                    checked={this.state.isLongBreakEnabled}
                                    onChange={this.toggleLongBreakEnabled.bind(this)}/>
                            <p>Long break</p>
                            <div className="pomodoro__box__content--right_side">
                                <input id="longBreak"
                                       value={this.state.longBreak}
                                       onBlur={this.changePomodoroProperty.bind(this)}
                                       onKeyDown={this.changePomodoroPropertyOnEnter.bind(this)}
                                       onChange={this.changePomodoroPropertyState.bind(this)}/>
                                <p>minutes</p>
                            </div>
                        </div>
                        <div className="pomodoro__box__content">
                            <p>Long break starts after</p>
                            <div className="pomodoro__box__content--right_side">
                                <input id="breakCounter"
                                       value={this.state.breakCounter}
                                       onBlur={this.changePomodoroProperty.bind(this)}
                                       onKeyDown={this.changePomodoroPropertyOnEnter.bind(this)}
                                       onChange={this.changePomodoroPropertyState.bind(this)}/>
                                <p>breaks</p>
                            </div>
                        </div>
                        <div className="pomodoro__border"></div>
                        <div className="pomodoro__box__content">
                            <p>Sound notification</p>
                            <Switch className="pomodoro__switch"
                                    checked={this.state.isSoundNotification}
                                    onChange={this.changeIsSoundNotification.bind(this)}/>
                        </div>
                        <div className="pomodoro__border"></div>
                        <div className="pomodoro__box__content">
                            <p>Automatic breaks</p>
                            <Switch className="pomodoro__switch"
                                    checked={this.state.isAutomaticStartStop}
                                    onChange={this.changeIsAutomaticStartStop.bind(this)}/>
                        </div>
                        <div className="pomodoro__border"></div>
                        <div className="pomodoro__box__content">
                            <p>{name}</p>
                            <Switch className="pomodoro__switch"
                                    checked={this.state.isDefaultProjectEnabled}
                                    onChange={this.changeIsDefaultProjectEnabled.bind(this)}/>
                        </div>
                        {this.state.isDefaultProjectEnabled && 
                            <div style={{ width: '360px' }}>
                                <DefaultPomodoroBreakProject
                                    workspaceSettings={this.props.workspaceSettings}
                                    changeSaved={this.props.changeSaved}
                                    resizeHeight={this.resizeHeight}
                                />
                            </div>
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default Pomodoro;