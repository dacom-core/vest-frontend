<template>
  <div> 
    <div v-if="loading" class="loading">
      <img class="dacom_logo" src="./../assets/gruzilka2.gif">  
    </div>

  <div v-if="bad_connection">
    <h1> Connection to Blockchain failed </h1>
    <div class="loading">
      <img class="dacom_logo" src="./../assets/pure_dacom.png">  
    </div> 
    <el-button type="primary" v-on:click="refresh_page();" plain> Try_again</el-button> 
  </div>

<el-container v-if="!loading && !bad_connection" direction="vertical" style="z-index: -1; width: 100%; padding: 20px;">
   <div style="margin-right: auto; margin-left: auto;">
    <h1 style="font-weight: 700; font-size: 28px">VESTING</h1>
    <img class="logo" src="./../assets/logo.png">  
   </div>
  <el-row>

    <el-row type="flex" justify="center">
      <el-col :xs="24" :md="24" class="hidden-sm-and-up">
        <p><b>Read Only Mode Enabled</b></p>
      </el-col>
    </el-row>

      <el-col :xs="24" :md="24" :lg="24" :xl="24">
        <el-card class="box-card username"
          shadow="hover"
          header="User"
          >
          <el-col :xs="24" :md="12" :lg="12" :xl="12">
          
            <el-input placeholder="Enter" ref="username" :disabled="edit_username_flag == 0" v-model="username">
            <el-button slot="append" type="success" size="mini" icon="el-icon-edit" v-if="edit_username_flag == 0" v-on:click="edit_username(username)"></el-button>
            <el-button slot="append" size="mini" icon="el-icon-check" v-if="edit_username_flag == 1" v-on:click="save_username(username)"></el-button>
          </el-input>
          <p></p>
          <div style="padding-top:5px; font-size: 18px; ">{{ account_data.core_liquid_balance == undefined ? "0.0000 " + core_symbol : account_data.core_liquid_balance }}</div>
          </el-col>

          <el-col :xs="24" :md="12" :lg="10" :xl="10" style="float: right; padding-bottom: 25px; padding-left: 15px;">
            <p style="margin-top: 0; margin-bottom: 0;">CPU</p>
            <el-progress :show-text="false" :stroke-width="14" :percentage="account_data.cpu_percent" color="rgba(64,158,255,.23)"></el-progress>
            <p style="margin-top: 0; margin-bottom: 0;">NET</p>
            <el-progress :show-text="false" :stroke-width="14" :percentage="account_data.net_percent" color="rgba(64,158,255,.23)"></el-progress>
            <p style="margin-top: 0; margin-bottom: 0;">RAM</p>
            <el-progress :show-text="false" :stroke-width="14" :percentage="account_data.ram_percent" color="rgba(64,158,255,.23)"></el-progress>
        </el-col>
        </el-card>
      </el-col>

            
  </el-row>     

  
  <el-row :gutter="0">
    <el-col :xs="24" :md="24" :lg="24" :xl="24" :span="24":offset="0">
      <h3 class="card-header"> Balances </h3>
      <el-table
        :show-overflow-tooltip="true"
        :data="tableData"
        :default-sort = "{prop: 'balance_id', order: 'descending'}"
        style="width: 100%;">

        <el-table-column
          prop="balance_id"
          label="ID"
          align="center"
          >
          <template slot-scope="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>


         
          <el-table-column
          label="Start at"
          align="center"
          >
          <template slot-scope="scope">
            <span>{{ scope.row.startat }}</span>
          </template>
        </el-table-column>


        <el-table-column
          label="Duration, sec"
          align="center"
          >
          <template slot-scope="scope">
            <span>{{ scope.row.duration }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="Total Amount"
          align="center"
          >
          <template slot-scope="scope">
            <span>{{ scope.row.amount }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="Available"
          align="center"
          >
        <template slot-scope="scope">
            <span>{{ scope.row.available }}</span>
          </template>
        </el-table-column>
        
        <el-table-column
          label="Withdrawed"
          align="center"
          >
          <template slot-scope="scope">
            <span>{{ scope.row.withdrawed }}</span>
          </template>
        </el-table-column>
    
      
        <el-table-column
          label="Operations"
          width="250"
          align="center">

          <template slot-scope="scope">
            <el-button 
              size="mini"
              type="danger"
              :disabled="read_mode == 1"
              v-on:click="withdraw(scope.row.id)">Withdraw</el-button>
            <el-button
              size="mini"
              type="primary"
              v-on:click="refresh_balance(scope.row.id)" :disabled="read_mode == 1">Refresh</el-button>

          </template>

        </el-table-column>
      </el-table>
  </el-col>

</el-row>
</el-container>

</div>

</div>

</template>




<script>
import Vue from 'vue'
import VueLocalStorage from 'vue-localstorage'


import ScatterJS from 'scatter-js/dist/scatter.esm';


Vue.use(VueLocalStorage)

Vue.localStorage.get('dacom_tc_username', '""')
let Tc = require('eosjs')
let TcApi = require('eosjs-api')


let endpoint = process.env.ENDPOINT
let protocol = process.env.PROTOCOL
let port = process.env.PORT
let chainid = process.env.CHAINID
let blockchain = process.env.BLOCKCHAIN

let options = {
  httpEndpoint: protocol + endpoint, 
  verbose: false, // API logging
  sign:true,
  logger: { // Default logging functions

  },
  fetchConfiguration: {}
}

let tcapi = TcApi(options)

const network = {
          blockchain: blockchain,
          host: endpoint, // ( or null if endorsed chainId )
          port: port, // ( or null if defaulting to 80 )
          chainId: chainid,
          verbose: true,
          sign: true
}


export default {
  name: 'Vesting',
  data () {
    return {
      scatter: undefined,
      contract_name : process.env.ROOT_CONTRACT,
      core_symbol: process.env.CORE_SYMBOL,
      core_precision: process.env.CORE_PRECISION,
      endpoint: process.env.ENDPOINT,
      endport: process.env.ENDPORT,
      chainid: process.env.CHAINID,
      host_name: "thirty.core",
      active_hosts: [],
      username: "",
      account_data: {core_liquid_balance:"0.0000 " + process.env.CORE_SYMBOL},
      pools: "",
      balances: "",
      spiral: "",
      head_block_num: "",
      info: "",
      current_cycle: "",
      current_pool: "",
      total_growth: "",
      color:"",
      total_in_box: "",
      next_pool: "",
      lept_cost: "",
      remain_lepts_in_tokens: "",
      remain_lepts: "",
      percent: 0,
      last_pool_color : "",
      tableData: [],
      rates: [],
      edit_username_flag: 0,
      deposit_amount_flag: 0,
      deposit_amount: "0.0000",
      deposit_lepts: 0,
      pool_expired: -1,
      fullscreenLoading: true,
      float_lept_cost: 0,
      showMenu: true,      
      read_mode: 0,
      xs: false,
      loading: true,
      bad_connection: false,
      isblack: false,


    }
  },

  beforeCreate (){

  },
  mounted(){
    ScatterJS.scatter.connect("TravelChain").then(connected => {
        if(connected){
            this.scatter = ScatterJS.scatter;
            window.scatter = null;
            console.log("scatter desktop mounted")
            console.log(this.scatter)

        }
    });

    // setTimeout(() => {
    //   this.scatter = window.scatter
    //   window.scatter = null
    //   console.log('scatter mounted')
    
    // }, 1500);
    
    // if (window.tscatter == "undefined")
    //   this.read_mode = 1;
  },
 
  created () {
    
    let username = Vue.localStorage.get('dacom_tc_username')
    this.username = username
    this.refresh_page()
  },

  components:{
    
  },

  methods:{
    get_hosts() {

    tcapi.getTableRows(true, this.contract_name, this.contract_name, 'account', 'username', 0, -1, 1000).
      then(data=>{
        //this.mainhost = data.rows[0]['username']
        this.active_hosts = []
       
        data.rows.map(element => {
          if (element.activated > 0){

            let skeleton = {
              username: element['username'],

              //purpose: element['purpose']
              purpose: ""
            }
            this.active_hosts.push(skeleton)
            this.mainhost = element.username  
          }
        });
    })

  },

  toogle_menu(){
    this.showMenu = !this.showMenu
  },

  refresh_page(){
    if ((this.username != "")&&(this.username != null)) this.get_user_resources()
    if ((this.username != "")&&(this.username != null)) this.get_balances()
    if ((this.username == "")||(this.username == null)) this.edit_username_flag = true
    
  },


  get_pools(){
    tcapi.getTableRows(true, this.contract_name, this.host_name, 'pool', 'id', 0, -1, 1000).
          then(data=>{
            this.pools = data.rows
            let pools = data.rows
            let last_id = data.rows.length
            
            let last_pool = pools[last_id-1]
            this.last_pool_color = last_pool['color']
            this.isblack = last_pool['color']=='black' ? true : false
            this.remain_lepts = last_pool['remain_lepts'] / last_pool['lepts_precision']
            this.percent = parseFloat(((last_pool['total_lepts'] - last_pool['remain_lepts']) / last_pool['total_lepts'] * 100).toFixed(3))

            this.total_in_box = last_pool['total_in_box']
            this.next_pool = last_pool['next_pool']
            this.lept_cost = last_pool['lept_cost']
            let float_lept_cost = last_pool['lept_cost'].substr(0, last_pool['lept_cost'].length - 3)
            float_lept_cost = parseFloat(float_lept_cost)
            this.float_lept_cost = float_lept_cost.toFixed(4)
            let remain_lepts_in_tokens = (last_pool['remain_lepts'] / last_pool['lepts_precision'] * float_lept_cost).toFixed(4)

            this.remain_lepts_in_tokens = remain_lepts_in_tokens + " " + this.core_symbol
            var pool_date = new Date(last_pool['pool_expired_at']);
            var bc_data = new Date(this.info.head_block_time)
            this.pool_expired = (pool_date - bc_data) / 1000


    })
  },

  get_dprops() {
    tcapi.getTableRows(true, this.contract_name, this.host_name, 'dprop', 'id', 0, -1, 1000).
          then(data=>{
            
            this.current_cycle = data.rows[0]['current_cycle_num']
            this.current_pool = data.rows[0]['current_pool_num']
            if ((this.username == "")||(this.username == null)||((this.username == 'undefined'))) this.loading = false
    });
  },

  get_spiral() {
    tcapi.getTableRows(true, this.contract_name, this.host_name, 'spiral', 'id', 0, -1, 1000).
          then(data=>{
            this.spiral = data.rows[0]              
    });
  },

  get_rates() {
    tcapi.getTableRows(true, this.contract_name, this.host_name, 'rate', 'id', 0, -1, 1000).
          then(data=>{
            let first_rate = data.rows[0]['sell_rate']
            let last_rate = data.rows[data.rows.length-1]['sell_rate']
            this.total_growth = last_rate/first_rate * 100
            this.rates = data.rows    

    });
  },


  get_user_resources(){

     tcapi.getAccount(this.username).
          then(data=>{
            this.account_data = data

            this.account_data.cpu_percent = data.cpu_limit.used / data.cpu_limit.available * 100
            this.account_data.cpu_percent = Math.round(this.account_data.cpu_percent * 100 ) / 100
            this.account_data.net_percent = data.net_limit.used / data.net_limit.available * 100
            this.account_data.net_percent = Math.round(this.account_data.net_percent * 100 ) / 100
            this.account_data.ram_percent = data.ram_usage / data.ram_quota * 100
            this.account_data.ram_percent = Math.round(this.account_data.ram_percent * 100 ) / 100


          }).catch((error)=>{
            this.edit_username_flag = 1;
            this.throwBCError(error)
          })
  },

  get_balances(){
    console.log("update")
    tcapi.getTableRows(true, this.contract_name, this.username, 'vesting', 'id', 0, -1, 1000).
          then(data=>{
            this.balances = data.rows
            let balances = data.rows
            this.tableData=[]
            
            data.rows.map(element => {
                console.log(element)
                let skeleton = {

                  id: element['id'],
                  owner: element['owner'], //Вывести в баланс
                  startat: element['startat'], //Вывести в баланс
                  duration: element['duration'],
                  amount: element["amount"],
                  available: element["available"],
                  available: element["available"],
                  withdrawed: element["withdrawed"],
                }
              this.tableData.push(skeleton)
              
            });
            console.log(this.tableData)
            this.loading = false
            this.bad_connection = false
    });

  },

  get_info(){
    tcapi.getInfo({}).then(data=> {
      this.info = data
      this.head_block_num = data.head_block_num
    });
  }, 

 alert_test(username){
  this.edit_username_flag = 1
  alert(username)
},


 edit_username(username){
  this.username = username
  this.edit_username_flag = 1
  
},

save_username(username){
  if ((username != "")&&(username != null)){
    this.edit_username_flag = 0
    this.username = username
    Vue.localStorage.set('dacom_tc_username', username)
    this.get_user_resources(username)
    this.get_balances()
  } else {
    this.username = "";
    this.account_data.core_liquid_balance = "0.0000 "+ this.core_symbol
    Vue.localStorage.set('dacom_tc_username', "")
  }
},

open_deposit(){
  if ((this.username != "")&&(this.username != null)){
    this.deposit_amount_flag=1
  } else {
    this.$refs.username.$el.focus()

    this.$notify.info({
        message: "Enter username first",
        customClass: "notificator",
      });
  }

},

show_back_func(){
  this.show_main = true
  this.show_faq = false
  this.show_rules = false 
  this.show_how_to_play = false
  this.show_how_it_works = false

},
show_faq_func(){
  this.show_main = false
  this.show_faq = true
},

show_rules_func(){
  this.show_main = false
  this.show_rules = true 
},

show_how_to_play_func(){
  this.show_main = false
  this.show_how_to_play = true
},

show_how_it_works_func(){
  this.show_main = false
  this.show_how_it_works = true
},



onchangeLepts(){
  
  let lepts = this.deposit_lepts
  let price = this.lept_cost
  price = price.substring(price.lenght-3, price.lenght)
  price = parseFloat(price)
  let amount = (lepts * price).toFixed(4)
  this.deposit_amount = amount

},

throwBCError(error){

  if (error == "TypeError: Failed to fetch"){
    this.bad_connection = true
    this.loading = false
  } else {

  this.$notify.error({
          title: 'Error',
          message: error,
          customClass: "notificator",
        });
  }
},


throwError(error){

    this.$notify.error({
          title: 'Error',
          message: error,
          customClass: "notificator",
        });
},

deposit(amount){
    let loading = this.loading_screen()
    scatter = this.scatter
    amount = amount + " " + this.core_symbol
    if (scatter != undefined){

      scatter.getIdentity({ accounts:[network] }).then(identity => {

          console.log(identity)

          const options = {
            authorization: this.username + '@active',
          }
          const eost = scatter.eos( network, Tc, options, 'https');
          eost.transfer(this.username, this.contract_name, amount, this.host_name).then(()=> {
            this.refresh_page()
            this.$notify.success({
              title: 'Success',
              message: "Deposit to DACom Protocol Recieved",
              customClass: "notificator"
            });
            loading.close()
          }).catch(error => {
            this.throwBCError(error)
            loading.close()
          })

          

      }).catch(error => {
          loading.close()
      }); 
    } else {
      loading.close()
      this.$notify.error({
              title: 'Error',
              message: "Scatter not founded. Install Scatter and import your private active key from account",
              customClass: "notificator"
            });

    }

},

withdraw(balance_id){
  let loading = this.loading_screen()
  scatter = this.scatter
  if (scatter != undefined){
  scatter.getIdentity({accounts:[network]}).then(identity => {
    const options = {
      authorization: this.username +'@active',
    }
    const eost = scatter.eos( network, Tc, options, 'https' );

      eost.contract(this.contract_name).then(contract => {
        contract.withdraw(this.username, balance_id, options).then(()=>{
            this.refresh_page()
            this.$notify.success({
              title: "Success",
              message: "Balance Withdrawed",
              customClass: "notificator"
            });
            loading.close()
        }).catch(error => {
          this.throwError(error)
           loading.close()
        })
      });
  }).catch(error => {
          this.throwError(error)
        });;
} else {
    loading.close()
     this.$notify.error({
              title: 'Error',
              message: "Scatter not founded. Install Scatter and import your private active key from account",
              customClass: "notificator"
            });
     
  }
},

refresh_balance(balance_id){
  let loading = this.loading_screen()
  scatter = this.scatter
  if (scatter != undefined){
  scatter.getIdentity({accounts:[network]}).then(identity => {
    const options = {
      authorization: this.username +'@active',
    }
    const eost = scatter.eos( network, Tc, options, 'https' );

      eost.contract(this.contract_name).then(contract => {
        contract.refresh(this.username, balance_id, options).then(()=>{
            this.refresh_page()
            this.$notify.success({
              title: "Success",
              message: "Balance Refreshed",
              customClass: "notificator"
            });
            loading.close()
        }).catch(error => {
          console.log(error)
          loading.close()
          this.throwError(error)
        })
      });
  }).catch(error => {
          loading.close()
        });;
} else {
  loading.close()
     this.$notify.error({
              title: 'Error',
              message: "Scatter not founded. Install Scatter and import your private active key from account",
              customClass: "notificator"
            });
     
}
},

global_refresh(){
  let loading = this.loading_screen()
  scatter = this.scatter
   if (scatter != undefined){
  scatter.getIdentity({accounts:[network]}).then(identity => {
    const options = {
      authorization: this.username +'@active',
    }
    const eost = scatter.eos( network, Tc, options, 'https' );

      eost.contract(this.contract_name).then(contract => {
        contract.refreshst(this.username, this.host_name, options).then(()=>{
            this.refresh_page()
            this.$notify.success({
              title: 'Success',
              message: "Global State Refreshed",
              customClass: "notificator"
            });
          loading.close()
        }).catch(error => {
          loading.close()
          this.throwError(error)
        })
      });
  }).catch(error => {
          loading.close()
        });
} else {
  loading.close()
     this.$notify.error({
              title: 'Error',
              message: "Scatter not founded. Install Scatter and import your private active key from account",
              customClass: "notificator"
            });
}
},


loading_screen() {
        const loading = this.$loading({
          lock: true,
          text: "Initializing the digital signature",
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        return loading;
},


PoolColorClass({row, rowIndex}) {
  
        if (row['color'] == "black") {
          return 'black';
        } else {
          return 'white';
        }
        return '';
      },


},



}


</script>

<style>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

.main_percent_line .el-progress-bar__innerText{
  font-size: 20px;

}

.el-progress.is-success .el-progress-bar__inner{
  background: linear-gradient(to left, #67c23a , #edefed);
  border-radius: 0px;
}

.el-progress-bar__outer{
 border-radius: 0px; 
}

.el-progress-bar__innerText {
  color: #765a5a;
}

.big_button{
  font-size: 30px !important;
  width: 250px !important;
  height: 70px;
}

.deposit_selector{
  width: 250px;
  height: 70px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 30px;
  margin-bottom: 30px;
}

.deposit_selector .el-input__inner {
  height: 70px;
}

.deposit_selector .el-input__suffix{
  top:26px;
  color: #c2c2c2;
}

.deposit_selector .el-input-group__prepend {
  background: #fbd4d4;
}
.deposit_selector .el-input-group__append {
  background: #67c23a61;
}

.username .el-input-group__append .el-button {
  margin: -10px -50px ;
  color: black;
}

.templ{
  width: 100%;
}

.el-progress-circle .el-progress__text{
    font-size: 20px;
    color: #409EFF;
}

.el-card__header{
    background: #e5f8f7;
    font-weight: 600;
}
.dacom_logo{
  padding-top: 30px;
  padding-bottom: 30px;
  opacity: 0.7;
  width: 100%;
}

.logo{
  padding-bottom: 30px;
  opacity: 0.7;
  width: 100px;  
}

.buttons_under_logo{
  padding-top : 20px;
  padding-bottom: 50px;
}

.resourse_limits{
  padding-top: 10px;
}

.el-table .current_rate{
  background: black;
}

.el-table .black {
    background: #f1f1f1;
}

.el-table .white {
    background: white;
}

.notificator{
  width: 500px;
  overflow-x: inherit;
}
.el-notification__content{
  text-align: center;
  overflow: -webkit-paged-x;
}

.el-card__header{
  background: #ecf5ff;
  padding: 10px;
}
.el-card{
  cursor:pointer;
  border-radius: 15px;
  border: 1px solid #c4c4c4c2;
  margin: 10px;
}



.game_panel{
  padding-top: 50px;
}
.refresh_gs_button{
  background: #409EFF;
    border-color: #409EFF;
    color: #fff;
}


input[type=number]::-webkit-inner-spin-button {
  margin-right: 10px;
  opacity: 1;
}

.vue-popover{
  background: #474747 !important;
  color:white !important;
}

.box_left_body{
  text-align: left;
}
.box_right_body{
  text-align: right;
  font-size: 18px;
}

.card-header{
  font-weight: 600;
}
.aside .el-button{
  margin: 0 !important;
  width: 100%;
}
.menu_img{
  width: 40px;
  opacity: 0.4;
  height: 40px;
  position: absolute;
  padding-left: 10px;

}

.menu_img:hover{
  width: 40px;
  opacity: 1;
  height: 40px;
  position: absolute;
  padding-left: 10px;

}

.nonactive{
  display: none !important; 
  transition-duration: 0.3s;
}

.hundrpercent{
  width: 100%
}
.nomarginforbuttons .el-button+.el-button {
margin-left: 0 !important;
}
.xsmenu{
  width: 95%;
  display: block;
}
.loading{
    width: 200px;
    margin-left: auto;
    margin-right: auto;
    padding-top:50px;
    padding-bottom: 70px;
}

.el-select-dropdown__item {
  width: 100%
}

.pool_color{
  background: white;
  padding-right: 10px;
  padding-left: 10px;
  border: 1px solid;
}

.black_pool_color{
  background: black;  
  color: white;
}

.header{
  padding-bottom: 10px;
}

</style>



